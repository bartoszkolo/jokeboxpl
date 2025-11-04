
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJokes, useCategory, useUserVotes, useUserFavorites, useVoteMutation, useFavoriteMutation } from '@/hooks/useJokes'
import { JokeWithAuthor, Category } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { InFeedAd, InFeedAdAlternate } from '@/components/InFeedAd'
import { SidebarAd } from '@/components/SidebarAd'
import { SEO, createCategoryStructuredData, createBreadcrumbStructuredData } from '@/components/SEO'
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/contexts/AuthContext'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)

  const JOKES_PER_PAGE = 15

  // Fetch category data
  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategory(slug || '')

  // Fetch jokes for this category with pagination
  const {
    data: jokesData,
    isLoading: jokesLoading,
    error: jokesError,
    refetch
  } = useJokes({
    page: currentPage,
    categoryId: category?.id,
    limit: JOKES_PER_PAGE,
    orderBy: 'created_at',
    enabled: !!category
  })

  // Fetch user votes and favorites for the jokes
  const jokeIds = jokesData?.jokes?.map(j => j.id) || []
  const { data: userVotes = [] } = useUserVotes(user?.id || '', jokeIds)
  const { data: userFavorites = [] } = useUserFavorites(user?.id || '', jokeIds)

  // Mutations for voting and favoriting
  const voteMutation = useVoteMutation()
  const favoriteMutation = useFavoriteMutation()

  // Process jokes with user-specific data
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])

  // Update jokes when data changes
  React.useEffect(() => {
    const processedJokes = jokesData?.jokes?.map(joke => ({
      ...joke,
      userVote: userVotes?.find(v => v.joke_id === joke.id) || null,
      isFavorite: userFavorites?.some(f => f.joke_id === joke.id) || false
    })) || []
    setJokes(processedJokes)
  }, [jokesData, userVotes, userFavorites])

  const totalJokes = jokesData?.totalCount || 0
  const totalPages = jokesData?.totalPages || 0

  const loading = categoryLoading || jokesLoading
  const error = categoryError || jokesError

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Redirect to home if category not found
  useEffect(() => {
    if (slug && category === undefined) {
      // Category is still loading
      return
    }
    if (slug && category === null) {
      navigate('/')
    }
  }, [slug, category, navigate])

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
                Nie udało się załadować kategorii. Spróbuj odświeżyć stronę.
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

  if (loading || !category) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-content-muted subheading">Ładowanie kategorii...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {category && (
        <SEO
          title={`${category.name} - Dowcipy`}
          description={category.description || `Najlepsze dowcipy w kategorii ${category.name}. Odkryj śmieszne żarty na temat ${category.name}!`}
          canonical={`/kategoria/${category.slug}`}
          structuredData={[
            createCategoryStructuredData({ ...category, joke_count: totalJokes }),
            createBreadcrumbStructuredData([
              { name: 'Strona główna', url: 'https://jokebox.pl' },
              { name: category.name, url: `https://jokebox.pl/kategoria/${category.slug}` }
            ])
          ]}
        />
      )}
      <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-primary hover:text-primary/80 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Powrót</span>
        </button>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2 heading">
                {category.name}
              </h1>
              {category.description_seo && (
                <p className="text-content-muted">
                  {category.description_seo}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Wyświetlono {jokes.length} z {totalJokes} dowcipów w tej kategorii
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          {jokes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">😄</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 heading">
                  Brak dowcipów w tej kategorii
                </h3>
                <p className="text-content-muted">
                  Bądź pierwszy i dodaj śmieszny dowcip!
                </p>
              </div>
            </div>
          ) : (
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
          )}

          {/* Pagination */}
          {jokes.length > 0 && (
            <div className="mt-8 flex justify-center items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={jokesLoading}
              />
            </div>
          )}

          {/* Jokes count info */}
          {totalJokes > 0 && (
            <div className="mt-4 text-center text-muted-foreground">
              <p className="text-sm">
                Wyświetlono {(currentPage * JOKES_PER_PAGE) + 1}-{Math.min((currentPage + 1) * JOKES_PER_PAGE, totalJokes)} z {totalJokes} dowcipów w kategorii {category.name}
              </p>
            </div>
          )}
        </div>
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
                  <p>Liczba dowcipów: {totalJokes}</p>
                  <p>Kategoria: {category.name}</p>
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
