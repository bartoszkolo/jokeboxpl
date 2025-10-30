// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { SEO, createCategoryStructuredData, createBreadcrumbStructuredData } from '@/components/SEO'
import { useAuth } from '@/contexts/AuthContext'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  const JOKES_PER_PAGE = 15

  useEffect(() => {
    if (slug) {
      fetchCategory()
    }
  }, [slug, user])

  const fetchCategory = async (reset = false) => {
    if (!slug) return

    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

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

      if (reset) {
        setCategory(categoryData)
        setJokes([])
        setHasMore(true)
        setCurrentPage(0)
      }

      const page = reset ? 0 : currentPage
      const offset = page * JOKES_PER_PAGE

      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        categoryId: categoryData.id,
        limit: JOKES_PER_PAGE,
        offset: offset,
        orderBy: 'created_at',
        ascending: false
      })

      // Check if there are more jokes to load
      if (jokesData.length < JOKES_PER_PAGE) {
        setHasMore(false)
      }

      let processedJokes = jokesData

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

        processedJokes = jokesData.map(joke => ({
          ...joke,
          userVote: votesData?.find(v => v.joke_id === joke.id) || null,
          isFavorite: favoritesData?.some(f => f.joke_id === joke.id) || false
        }))
      }

      if (reset) {
        setJokes(processedJokes)
      } else {
        setJokes(prevJokes => [...prevJokes, ...processedJokes])
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      navigate('/')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleVoteChange = async (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => {
    if (voteData) {
      // Update just the specific joke that was voted on with animation
      setJokes(prevJokes =>
        prevJokes.map(joke => {
          if (joke.id === jokeId) {
            return {
              ...joke,
              upvotes: voteData.upvotes ?? joke.upvotes,
              downvotes: voteData.downvotes ?? joke.downvotes,
              score: voteData.score ?? joke.score,
              userVote: voteData.userVote ?? joke.userVote
            }
          }
          return joke
        })
      )
    } else {
      // Fallback to full refresh if no vote data provided
      fetchCategory(true)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setCurrentPage(prev => prev + 1)
      fetchCategory(false)
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
    <>
      {category && (
        <SEO
          title={`${category.name} - Dowcipy`}
          description={category.description || `Najlepsze dowcipy w kategorii ${category.name}. Odkryj śmieszne żarty na temat ${category.name}!`}
          canonical={`/kategoria/${category.slug}`}
          structuredData={[
            createCategoryStructuredData({ ...category, joke_count: jokes.length }),
            createBreadcrumbStructuredData([
              { name: 'Strona główna', url: 'https://jokebox.pl' },
              { name: category.name, url: `https://jokebox.pl/kategoria/${category.slug}` }
            ])
          ]}
        />
      )}
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
            Wyświetlono {jokes.length} {jokes.length === 1 ? 'dowcip' : 'dowcipów'}{hasMore ? ' (wczytywanie...)' : ''}
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
              <JokeCard key={joke.id} joke={joke} onVoteChange={handleVoteChange} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && jokes.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ładowanie...
                </>
              ) : (
                'Wczytaj więcej dowcipów'
              )}
            </button>
          </div>
        )}

        {!hasMore && jokes.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p>To już wszystkie dowcipy w tej kategorii!</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
