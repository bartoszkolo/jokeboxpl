// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { RandomJoke } from '@/components/RandomJoke'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  const JOKES_PER_PAGE = 15

  useEffect(() => {
    fetchCategories()
    // Reset pagination when category changes
    setCurrentPage(0)
    setJokes([])
    setHasMore(true)
    fetchJokes(true)
  }, [selectedCategory, user])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (data) setCategories(data)
  }

  const fetchJokes = async (reset = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const page = reset ? 0 : currentPage
      const offset = page * JOKES_PER_PAGE

      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        categoryId: selectedCategory,
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
        // Fetch user votes and favorites for the new jokes
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
      console.error('Error fetching jokes:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setCurrentPage(prev => prev + 1)
      fetchJokes(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4 heading">
            Witaj w Jokebox!
          </h1>
          <p className="text-xl text-content-muted max-w-2xl mx-auto subheading">
            Odkryj najlepsze polskie dowcipy, głosuj na swoje ulubione i dodawaj własne żarty
          </p>
        </div>

        {/* Random Joke & Daily Joke Section */}
        <RandomJoke />

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Jokes Content */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-content-muted subheading">Ładowanie dowcipów...</p>
            </div>
          ) : jokes.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">😄</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 heading">
                  Brak dowcipów w tej kategorii
                </h3>
                <p className="text-content-muted mb-6">
                  Bądź pierwszy i dodaj śmieszny dowcip!
                </p>
              </div>
              {user && (
                <Link to="/dodaj" className="btn-primary">
                  Dodaj pierwszy dowcip
                </Link>
              )}
              {!user && (
                <div className="space-y-3">
                  <p className="text-content-muted">
                    Zaloguj się, aby dodawać dowcipy
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/logowanie" className="btn-outline">
                      Zaloguj się
                    </Link>
                    <Link to="/rejestracja" className="btn-primary">
                      Załóż konto
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jokes.map(joke => (
                <JokeCard key={joke.id} joke={joke} onVoteChange={() => fetchJokes(true)} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && jokes.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-primary"
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
            <div className="mt-8 text-center text-content-muted">
              <p className="subheading">To już wszystkie dowcipy w tej kategorii!</p>
            </div>
          )}
        </div>
          </div>

          {/* Right Sidebar - Categories */}
          <div className="lg:w-64">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4 heading">Kategorie</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    selectedCategory === null
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background text-content-muted hover:bg-primary hover:text-primary-foreground border border-border'
                  }`}
                >
                  Wszystkie
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-background text-content-muted hover:bg-primary hover:text-primary-foreground border border-border'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
