// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types/database'
import { MathCaptcha } from '@/components/MathCaptcha'
import { comprehensiveDuplicateCheck } from '@/lib/duplicateChecker'

export function AddJokePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean
    reason?: string
    similarJoke?: { content: string; id: number; similarity: number }
  } | null>(null)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/logowanie')
      return
    }
    fetchCategories()
  }, [user, navigate])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
  }

  const checkForDuplicates = async (jokeContent: string) => {
    if (jokeContent.trim().length < 10) {
      setDuplicateWarning(null)
      return
    }

    setCheckingDuplicates(true)
    try {
      // Pobierz istniejące dowcipy z bazy
      const { data: existingJokes, error } = await supabase
        .from('jokes')
        .select('id, content')
        .in('status', ['published', 'pending']) // Sprawdzaj zarówno opublikowane jak i oczekujące

      if (error) {
        console.error('Error fetching jokes for duplicate check:', error)
        return
      }

      const duplicateResult = await comprehensiveDuplicateCheck(jokeContent, existingJokes || [], {
        similarityThreshold: 85, // Bardzo ścisłe sprawdzanie
        checkFragments: true,
        fragmentLength: 20,
        fragmentThreshold: 90
      })

      setDuplicateWarning(duplicateResult.isDuplicate ? duplicateResult : null)
    } catch (err) {
      console.error('Error checking duplicates:', err)
    } finally {
      setCheckingDuplicates(false)
    }
  }

  // Funkcja do sprawdzania duplikatów z opóźnieniem (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim().length >= 10) {
        checkForDuplicates(content)
      } else {
        setDuplicateWarning(null)
      }
    }, 1000) // 1 sekunda opóźnienia

    return () => clearTimeout(timer)
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    if (content.trim().length < 10) {
      setError('Dowcip musi mieć minimum 10 znaków')
      setLoading(false)
      return
    }

    if (!captchaVerified) {
      setError('Proszę rozwiązać captchę')
      setLoading(false)
      return
    }

    if (duplicateWarning?.isDuplicate) {
      setError('Twój dowcip jest zbyt podobny do już istniejącego. Spróbuj go zmodyfikować.')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('jokes')
        .insert({
          content: content.trim(),
          author_id: user.id,
          category_id: categoryId,
          status: 'pending'
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Błąd podczas dodawania dowcipu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Dowcip dodany!</h3>
          <p className="text-gray-600">
            Twój dowcip czeka na moderację. Zostanie opublikowany po zatwierdzeniu przez administratora.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dodaj nowy dowcip
          </h2>
          <p className="text-gray-600 mb-8">
            Podziel się swoim humorem z innymi. Dowcip zostanie sprawdzony przez moderatora przed publikacją.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategoria (opcjonalnie)
              </label>
              <select
                id="category"
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Wybierz kategorię...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Treść dowcipu
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wpisz tutaj swój dowcip..."
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.length} / minimum 10 znaków
              </p>
            </div>

            {/* Ostrzeżenie o duplikacie */}
            {duplicateWarning && duplicateWarning.isDuplicate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      Ostrzeżenie o możliwym duplikacie
                    </h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      {duplicateWarning.reason}
                    </p>
                    {duplicateWarning.similarJoke && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                        <p className="text-xs text-yellow-600 mb-1">
                          Podobny dowcip ({duplicateWarning.similarJoke.similarity}% podobieństwa):
                        </p>
                        <p className="text-sm text-yellow-800 italic">
                          "{duplicateWarning.similarJoke.content.length > 100
                            ? duplicateWarning.similarJoke.content.substring(0, 100) + '...'
                            : duplicateWarning.similarJoke.content}"
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-yellow-600 mt-2">
                      Możesz spróbować zmodyfikować dowcip, aby był bardziej unikalny.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wskaźnik sprawdzania duplikatów */}
            {checkingDuplicates && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">Sprawdzanie możliwych duplikatów...</span>
                </div>
              </div>
            )}

            <div>
              <MathCaptcha
                onVerify={(isValid) => setCaptchaVerified(isValid)}
                onReset={() => setError('')}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Dodawanie...' : 'Dodaj dowcip'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
