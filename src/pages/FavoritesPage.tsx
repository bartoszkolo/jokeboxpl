
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserAllFavorites, useVoteMutation, useFavoriteMutation } from '@/hooks/useJokes'
import { JokeWithAuthor } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { Heart } from 'lucide-react'
import { Pagination } from '@/components/Pagination'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)

  const FAVORITES_PER_PAGE = 15

  // Note: Auth check is now handled by ProtectedRoute in App.tsx
  // This prevents content flash and provides better UX

  // Fetch user favorites with pagination
  const {
    data: favoritesData,
    isLoading: loading,
    error,
    refetch
  } = useUserAllFavorites(user?.id || '', currentPage, FAVORITES_PER_PAGE)

  // Mutations for voting and favoriting
  const voteMutation = useVoteMutation()
  const favoriteMutation = useFavoriteMutation()

  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])

  // Update jokes when data changes
  React.useEffect(() => {
    setJokes(favoritesData?.jokes || [])
  }, [favoritesData])
  const totalJokes = favoritesData?.totalCount || 0
  const totalPages = favoritesData?.totalPages || 0

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
        joke.id === updatedJoke.id ? updatedJoke : joke
      )
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
                Wystąpił błąd
              </h3>
              <p className="text-content-muted mb-6">
                Nie udało się załadować ulubionych dowcipów. Spróbuj odświeżyć stronę.
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
    <div className="min-h-screen bg-muted/30 transition-safe">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="text-red-500" size={36} fill="currentColor" />
            <h1 className="text-4xl font-bold text-gradient heading transition-safe">
              Twoje ulubione dowcipy
            </h1>
          </div>
          <p className="text-muted-foreground subheading transition-safe">
            Dowcipy, które oznaczyłeś jako ulubione ({totalJokes} {totalJokes === 1 ? 'dowcip' : 'dowcipów'})
          </p>
        </div>

        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-8 transition-safe">
          {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground transition-safe">Ładowanie ulubionych...</p>
          </div>
        ) : jokes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto mb-4 text-muted-foreground" size={64} />
            <p className="text-muted-foreground text-lg mb-4 transition-safe">
              Nie masz jeszcze żadnych ulubionych dowcipów
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Przeglądaj dowcipy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jokes.map(joke => (
              <JokeCard key={joke.id} joke={joke} onVoteChange={handleVoteChange} onJokeUpdate={handleJokeUpdate} />
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
                Wyświetlono {(currentPage * FAVORITES_PER_PAGE) + 1}-{Math.min((currentPage + 1) * FAVORITES_PER_PAGE, totalJokes)} z {totalJokes} ulubionych dowcipów
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
