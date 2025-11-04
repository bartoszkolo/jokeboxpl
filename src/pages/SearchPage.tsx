
import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useSearchJokes, useCategories, useUserVotes, useUserFavorites, useVoteMutation, useFavoriteMutation } from '@/hooks/useJokes'
import { JokeCard } from '@/components/JokeCard'
import { InFeedAd, InFeedAdAlternate } from '@/components/InFeedAd'
import { SidebarAd } from '@/components/SidebarAd'
import { SEO, createBreadcrumbStructuredData } from '@/components/SEO'
import { Pagination } from '@/components/Pagination'
import { Loader2, Search as SearchIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { user } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'created_at' | 'score' | 'relevance'>('relevance')

  // Get current page from URL params, default to 0
  const currentPage = parseInt(searchParams.get('page') || '0')

  // Fetch categories
  const { data: categories = [] } = useCategories()

  // Fetch search results
  const {
    data: searchData,
    isLoading: loading,
    error
  } = useSearchJokes(query, {
    categoryId: selectedCategory,
    sortBy,
    page: currentPage
  })

  // Fetch user votes and favorites for the jokes
  const jokeIds = searchData?.jokes?.map(j => j.id) || []
  const { data: userVotes = [] } = useUserVotes(user?.id || '', jokeIds)
  const { data: userFavorites = [] } = useUserFavorites(user?.id || '', jokeIds)

  // Mutations for voting and favoriting
  const voteMutation = useVoteMutation()
  const favoriteMutation = useFavoriteMutation()

  // Process jokes with user-specific data
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])

  // Update jokes when data changes
  React.useEffect(() => {
    const processedJokes = searchData?.jokes?.map(joke => ({
      ...joke,
      userVote: userVotes?.find(v => v.joke_id === joke.id) || null,
      isFavorite: userFavorites?.some(f => f.joke_id === joke.id) || false
    })) || []
    setJokes(processedJokes)
  }, [searchData, userVotes, userFavorites])

  const totalCount = searchData?.totalCount || 0
  const totalPages = searchData?.totalPages || 0

  const handlePageChange = (page: number) => {
    // Update URL params with new page
    const newParams = new URLSearchParams(searchParams)
    if (page === 0) {
      newParams.delete('page')
    } else {
      newParams.set('page', page.toString())
    }
    setSearchParams(newParams)

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleVoteChange = async (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => {
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

  const handleJokeUpdate = (updatedJoke: JokeWithAuthor) => {
    // Update the joke in the local state
    setJokes(prevJokes =>
      prevJokes.map(joke =>
        joke.id === updatedJoke.id
          ? {
              ...updatedJoke,
              userVote: userVotes?.find(v => v.joke_id === updatedJoke.id) || null,
              isFavorite: userFavorites?.some(f => f.joke_id === updatedJoke.id) || false
            }
          : joke
      )
    )
  }

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
                Wystąpił błąd wyszukiwania
              </h3>
              <p className="text-content-muted mb-6">
                Nie udało się wyszukać dowcipów. Spróbuj zmienić zapytanie.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-16">
            <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2 heading">
              Wyszukaj dowcipy
            </h2>
            <p className="text-content-muted">
              Użyj wyszukiwarki w górnej części strony, aby znaleźć interesujące Cię dowcipy.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={query ? `Wyniki wyszukiwania: "${query}"` : 'Wyszukiwarka dowcipów'}
        description={query
          ? `Znajdź najlepsze dowcipy dla zapytania "${query}". Odkryj śmieszne żarty dopasowane do Twoich preferencji.`
          : 'Wyszukaj najlepsze polskie dowcipy. Znajdź śmieszne żarty według kategorii i słów kluczowych.'
        }
        canonical={query ? `/wyszukiwarka?q=${encodeURIComponent(query)}` : '/wyszukiwarka'}
        noindex={!query} // Don't index empty search pages
        structuredData={createBreadcrumbStructuredData([
          { name: 'Strona główna', url: 'https://jokebox.pl' },
          { name: 'Wyszukiwarka', url: 'https://jokebox.pl/wyszukiwarka' }
        ])}
      />
      <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Nagłówek */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 heading">
                Wyniki wyszukiwania
              </h1>
              <p className="text-content-muted">
                {totalCount > 0 ? (
                  <>
                    Znaleziono <span className="font-semibold">{totalCount}</span> dowcipów dla zapytania:
                    <span className="font-semibold"> "{query}"</span>
                    {totalPages > 1 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (strona {currentPage + 1} z {totalPages})
                      </span>
                    )}
                    {jokes.length > 0 && sortBy === 'relevance' && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (sortowane według trafności)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Brak wyników dla zapytania: <span className="font-semibold"> "{query}"</span>
                  </>
                )}
              </p>
            </div>

            {/* Filtry */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Filtr kategorii */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kategoria
                  </label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    <option value="">Wszystkie kategorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sortowanie */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sortowanie
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'created_at' | 'score' | 'relevance')}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    <option value="relevance">Najbardziej trafne</option>
                    <option value="created_at">Najnowsze</option>
                    <option value="score">Najpopularniejsze</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Wyniki */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jokes.length > 0 ? (
              <>
                <div className="space-y-4">
                  {jokes.map((joke, index) => (
                    <React.Fragment key={joke.id}>
                      <JokeCard joke={joke} onVoteChange={handleVoteChange} onJokeUpdate={handleJokeUpdate} />
                      {/* Insert ad after every 3 jokes */}
                      {(index + 1) % 3 === 0 && index < jokes.length - 1 && (
                        index % 6 === 2 ? <InFeedAdAlternate /> : <InFeedAd />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      loading={loading}
                    />
                  </div>
                )}

                {/* Results count info */}
                <div className="text-center mt-4 text-sm text-content-muted">
                  Pokazywanie {currentPage * 15 + 1} - {Math.min((currentPage + 1) * 15, totalCount)} z {totalCount} wyników
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2 heading">
                  Brak wyników
                </h2>
                <p className="text-content-muted mb-4">
                  Nie znaleziono dowcipów pasujących do Twojego zapytania.
                </p>
                <Link
                  to="/"
                  className="btn-primary"
                >
                  Powrót do strony głównej
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-64">
            {/* Sidebar Ad */}
            <div className="mb-6">
              <SidebarAd sticky={false} />
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-foreground mb-4 heading">Informacje</h3>
              <div className="space-y-3">
                <div className="text-sm text-content-muted">
                  <p>Liczba wyników: {totalCount}</p>
                  <p>Zapytanie: "{query}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
