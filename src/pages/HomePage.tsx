// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchJokes()
  }, [selectedCategory, user])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
  }

  const fetchJokes = async () => {
    setLoading(true)
    try {
      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        categoryId: selectedCategory,
        orderBy: 'created_at',
        ascending: false
      })

      if (jokesData && user) {
        // Fetch user votes and favorites
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
      console.error('Error fetching jokes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Witaj w Jokebox!
          </h1>
          <p className="text-gray-600">
            Odkryj najlepsze polskie dowcipy, głosuj i dodawaj własne
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Wszystkie
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Ładowanie dowcipów...</p>
          </div>
        ) : jokes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg mb-4">
              Brak dowcipów w tej kategorii
            </p>
            {user && (
              <Link
                to="/dodaj"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
              >
                Dodaj pierwszy dowcip
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jokes.map(joke => (
              <JokeCard key={joke.id} joke={joke} onVoteChange={fetchJokes} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
