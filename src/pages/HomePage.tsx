// @ts-nocheck
import { useState, useEffect } from 'react'
import { useJokes, useCategories, useUserVotes, useUserFavorites, useVoteMutation, useFavoriteMutation } from '@/hooks/useJokes'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { SEO, createBreadcrumbStructuredData } from '@/components/SEO'
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Shuffle } from 'lucide-react'

export function HomePage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const JOKES_PER_PAGE = 15

  // Fetch categories
  const { data: categories = [] } = useCategories()

  // Fetch jokes with pagination and filtering
  const {
    data: jokesData,
    isLoading: loading,
    error,
    refetch
  } = useJokes({
    page: currentPage,
    categoryId: selectedCategory,
    limit: JOKES_PER_PAGE,
    orderBy: 'created_at'
  })

  // Fetch user votes and favorites for the jokes
  const jokeIds = jokesData?.jokes?.map(j => j.id) || []
  const { data: userVotes = [] } = useUserVotes(user?.id || '', jokeIds)
  const { data: userFavorites = [] } = useUserFavorites(user?.id || '', jokeIds)

  // Mutations for voting and favoriting
  const voteMutation = useVoteMutation()
  const favoriteMutation = useFavoriteMutation()

  // Process jokes with user-specific data
  const jokes = jokesData?.jokes?.map(joke => ({
    ...joke,
    userVote: userVotes?.find(v => v.joke_id === joke.id) || null,
    isFavorite: userFavorites?.some(f => f.joke_id === joke.id) || false
  })) || []

  const handleVoteChange = async (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => {
    // React Query handles optimistic updates automatically, so we don't need to manually update state
    if (user && voteData?.userVote?.vote_type) {
      voteMutation.mutate({
        jokeId,
        userId: user.id,
        voteType: voteData.userVote.vote_type
      })
    }
  }

  const handleFavoriteToggle = (jokeId: number) => {
    if (user) {
      favoriteMutation.mutate({
        jokeId,
        userId: user.id
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setCurrentPage(0) // Reset to first page when category changes
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const totalJokes = jokesData?.totalCount || 0
  const totalPages = jokesData?.totalPages || 0

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 heading">
                Wystąpił błąd
              </h3>
              <p className="text-content-muted mb-6">
                Nie udało się załadować dowcipów. Spróbuj odświeżyć stronę.
              </p>
              <button
                onClick={() => refetch()}
                className="btn-primary"
              >
                Odśwież
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                  onClick={() => handleCategoryChange(null)}
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
                    onClick={() => handleCategoryChange(category.id)}
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
