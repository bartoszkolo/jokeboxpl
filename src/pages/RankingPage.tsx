
import React, { useState } from 'react'
import { useJokes, useUserVotes, useUserFavorites, useVoteMutation, useFavoriteMutation } from '@/hooks/useJokes'
import { JokeWithAuthor } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { useAuth } from '@/contexts/AuthContext'
import { Trophy } from 'lucide-react'

type TimeRange = 'all' | 'week' | 'month'

export function RankingPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('all')

  // Fetch top jokes sorted by score
  const {
    data: jokesData,
    isLoading: loading,
    error,
    refetch
  } = useJokes({
    page: 0,
    categoryId: null,
    limit: 50,
    orderBy: 'score',
    ascending: false
  })

  // Fetch user votes and favorites for the jokes
  const jokeIds = jokesData?.jokes?.map(j => j.id) || []
  const { data: userVotes = [] } = useUserVotes(user?.id || '', jokeIds)
  const { data: userFavorites = [] } = useUserFavorites(user?.id || '', jokeIds)

  // Mutations for voting and favoriting
  const voteMutation = useVoteMutation()
  const favoriteMutation = useFavoriteMutation()

  // Filter jokes by time range
  const getFilteredJokes = (jokes: JokeWithAuthor[]) => {
    if (timeRange === 'all') return jokes

    const now = new Date()
    let cutoffDate: Date

    if (timeRange === 'week') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeRange === 'month') {
      cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    } else {
      return jokes
    }

    return jokes.filter(joke => new Date(joke.created_at) >= cutoffDate)
  }

  // Process jokes with user-specific data and time filtering
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])

  // Update jokes when data changes
  React.useEffect(() => {
    const baseJokes = jokesData?.jokes || []
    const filteredJokes = getFilteredJokes(baseJokes)
    const processedJokes = filteredJokes.map(joke => ({
      ...joke,
      userVote: userVotes?.find(v => v.joke_id === joke.id) || null,
      isFavorite: userFavorites?.some(f => f.joke_id === joke.id) || false
    }))
    setJokes(processedJokes)
  }, [jokesData, userVotes, userFavorites, timeRange])

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
                Wystąpił błąd
              </h3>
              <p className="text-content-muted mb-6">
                Nie udało się załadować rankingu. Spróbuj odświeżyć stronę.
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
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="text-yellow-500" size={36} />
            <h1 className="text-4xl font-bold text-gradient heading">
              Ranking Dowcipów
            </h1>
          </div>
          <p className="text-content-muted subheading">
            Najlepiej oceniane dowcipy w serwisie
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg transition ${
              timeRange === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground border border-border'
            }`}
          >
            Wszystkie czasy
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg transition ${
              timeRange === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground border border-border'
            }`}
          >
            Ostatni miesiąc
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg transition ${
              timeRange === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground border border-border'
            }`}
          >
            Ostatni tydzień
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-content-muted subheading">Ładowanie rankingu...</p>
          </div>
        ) : jokes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 heading">
                Brak dowcipów w tym okresie
              </h3>
              <p className="text-content-muted">
                Spróbuj wybrać inny zakres czasowy
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {jokes.map((joke, index) => (
              <div key={joke.id} className="relative">
                <div className="absolute left-0 top-0 -ml-12 mt-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <JokeCard joke={joke} onVoteChange={handleVoteChange} onJokeUpdate={handleJokeUpdate} />
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
