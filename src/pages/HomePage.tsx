// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { SEO, createBreadcrumbStructuredData } from '@/components/SEO'
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Shuffle } from 'lucide-react'

export function HomePage() {
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalJokes, setTotalJokes] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const JOKES_PER_PAGE = 15

  useEffect(() => {
    fetchCategories()
    // Reset pagination when category changes
    setCurrentPage(0)
    setJokes([])
    fetchJokes()
  }, [selectedCategory, user])

  useEffect(() => {
    fetchJokes()
  }, [currentPage])

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
      const offset = currentPage * JOKES_PER_PAGE

      // Fetch total count for pagination
      let countQuery = supabase
        .from('jokes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')

      if (selectedCategory) {
        countQuery = countQuery.eq('category_id', selectedCategory)
      }

      const { count: totalCount } = await countQuery
      const calculatedTotalPages = Math.ceil((totalCount || 0) / JOKES_PER_PAGE)
      setTotalJokes(totalCount || 0)
      setTotalPages(calculatedTotalPages)

      // Fetch jokes for current page
      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        categoryId: selectedCategory,
        limit: JOKES_PER_PAGE,
        offset: offset,
        orderBy: 'created_at',
        ascending: false
      })

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

      setJokes(processedJokes)
    } catch (error) {
      console.error('Error fetching jokes:', error)
    } finally {
      setLoading(false)
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
      fetchJokes()
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <>
      <SEO
        title={selectedCategoryData ? `${selectedCategoryData.name} - Dowcipy` : 'Najlepsze dowcipy'}
        description={selectedCategoryData
          ? `Odkryj najlepsze dowcipy w kategorii ${selectedCategoryData.name}. Śmiej się razem z nami!`
          : 'Jokebox to miejsce z najlepszymi polskimi dowcipami. Przeglądaj, dodawaj i głosuj na śmieszne żarty!'
        }
        canonical={selectedCategoryData ? `/kategoria/${selectedCategoryData.slug}` : '/'}
        structuredData={createBreadcrumbStructuredData([
          { name: 'Strona główna', url: 'https://jokebox.pl' },
          ...(selectedCategoryData ? [{ name: selectedCategoryData.name, url: `https://jokebox.pl/kategoria/${selectedCategoryData.slug}` }] : [])
        ])}
      />
      <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
  
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
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/logowanie" className="btn-outline">
                      Zaloguj się
                    </Link>
                    <Link to="/rejestracja" className="btn-primary">
                      Załóż konto
                    </Link>
                    <Link
                      to="/losuj"
                      className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
                    >
                      <Shuffle className="h-5 w-5 animate-pulse" />
                      <span>Losuj dowcip 🎲</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jokes.map(joke => (
                <JokeCard key={joke.id} joke={joke} onVoteChange={handleVoteChange} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {jokes.length > 0 && (
            <div className="mt-8 flex justify-center items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          )}

          {/* Jokes count info */}
          {totalJokes > 0 && (
            <div className="mt-4 text-center text-muted-foreground">
              <p className="text-sm">
                Wyświetlono {(currentPage * JOKES_PER_PAGE) + 1}-{Math.min((currentPage + 1) * JOKES_PER_PAGE, totalJokes)} z {totalJokes} dowcipów
                {selectedCategoryData && ` w kategorii ${selectedCategoryData.name}`}
              </p>
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

        {/* SEO Description Section */}
        <div className="mt-16 mb-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gradient mb-3 heading">
              Witaj w Jokebox!
            </h1>
            <p className="text-sm text-content-muted max-w-3xl mx-auto leading-relaxed">
              Odkryj najlepsze polskie dowcipy, głosuj na swoje ulubione i dodawaj własne żarty.
              Jokebox to największa polska platforma z dowcipami gdzie znajdziesz tysiące żartów
              w różnych kategoriach. Dołącz do naszej społeczności, baw się dobrze i dziel się
              humorem z innymi. Codziennie nowe dowcipy, rankingi i możliwość dodawania
              własnych żartów.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
