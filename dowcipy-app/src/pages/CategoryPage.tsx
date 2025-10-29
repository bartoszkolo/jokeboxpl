// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { useAuth } from '@/contexts/AuthContext'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchCategory()
    }
  }, [slug, user])

  const fetchCategory = async () => {
    if (!slug) return

    setLoading(true)
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!categoryData) {
        navigate('/')
        return
      }

      setCategory(categoryData)

      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        categoryId: categoryData.id,
        orderBy: 'created_at',
        ascending: false
      })

      if (jokesData && user) {
        const jokeIds = jokesData.map(j => j.id)
        
        const [{ data: votesData }, { data: favoritesData }] = await Promise.all([
          supabase
            .from('votes')
            .select('*')
            .eq('user_id', user.id)
            .in('joke_id', jokeIds),
          supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .in('joke_id', jokeIds)
        ])

        const jokesWithUserData = jokesData.map(joke => ({
          ...joke,
          userVote: votesData?.find(v => v.joke_id === joke.id) || null,
          isFavorite: favoritesData?.some(f => f.joke_id === joke.id) || false
        }))

        setJokes(jokesWithUserData)
      } else if (jokesData) {
        setJokes(jokesData)
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Powrót</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          {category.description_seo && (
            <p className="text-gray-600">
              {category.description_seo}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Znaleziono {jokes.length} {jokes.length === 1 ? 'dowcip' : 'dowcipów'}
          </p>
        </div>

        {jokes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              Brak dowcipów w tej kategorii
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jokes.map(joke => (
              <JokeCard key={joke.id} joke={joke} onVoteChange={fetchCategory} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
