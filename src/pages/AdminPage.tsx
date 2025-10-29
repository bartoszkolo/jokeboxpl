// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { Joke, Category } from '@/types/database'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'

export function AdminPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [pendingJokes, setPendingJokes] = useState<Joke[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'categories'>('pending')

  useEffect(() => {
    if (!user || !profile?.is_admin) {
      navigate('/')
      return
    }
    fetchPendingJokes()
    fetchCategories()
  }, [user, profile, navigate])

  const fetchPendingJokes = async () => {
    setLoading(true)
    try {
      const jokesData = await fetchJokesWithDetails({
        status: 'pending',
        orderBy: 'created_at',
        ascending: true,
        limit: 100
      })
      if (jokesData) setPendingJokes(jokesData)
    } catch (error) {
      console.error('Error fetching pending jokes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
  }

  const moderateJoke = async (jokeId: number, status: 'published' | 'rejected') => {
    try {
      await supabase
        .from('jokes')
        .update({ status })
        .eq('id', jokeId)

      fetchPendingJokes()
    } catch (error) {
      console.error('Error moderating joke:', error)
    }
  }

  const deleteJoke = async (jokeId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dowcip?')) return

    try {
      await supabase
        .from('jokes')
        .delete()
        .eq('id', jokeId)

      fetchPendingJokes()
    } catch (error) {
      console.error('Error deleting joke:', error)
    }
  }

  if (!profile?.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel Administratora
          </h1>
          <p className="text-gray-600">
            Moderuj dowcipy i zarządzaj treścią
          </p>
        </div>

        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-md transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Poczekalnia ({pendingJokes.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-md transition ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Kategorie ({categories.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Ładowanie...</p>
              </div>
            ) : pendingJokes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">
                  Brak dowcipów do moderacji
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJokes.map(joke => (
                  <div key={joke.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                      <p className="text-gray-800 text-lg whitespace-pre-wrap">
                        {joke.content}
                      </p>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      <span>Dodane: {new Date(joke.created_at).toLocaleString('pl-PL')}</span>
                      {joke.category_id && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Kategoria: {categories.find(c => c.id === joke.category_id)?.name}</span>
                        </>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => moderateJoke(joke.id, 'published')}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                      >
                        <CheckCircle size={18} />
                        <span>Zatwierdź</span>
                      </button>
                      <button
                        onClick={() => moderateJoke(joke.id, 'rejected')}
                        className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                      >
                        <XCircle size={18} />
                        <span>Odrzuć</span>
                      </button>
                      <button
                        onClick={() => deleteJoke(joke.id)}
                        className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                      >
                        <Trash2 size={18} />
                        <span>Usuń</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kategorie
            </h2>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md">
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                    {category.description_seo && (
                      <p className="text-sm text-gray-600 mt-1">{category.description_seo}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
