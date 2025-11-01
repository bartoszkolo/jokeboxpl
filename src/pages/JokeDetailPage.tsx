
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJokeBySlug, useUserVotes, useUserFavorites, useVoteMutation, useFavoriteMutation } from '@/hooks/useJokes'
import { JokeWithAuthor } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { SEO, createJokeStructuredData, createBreadcrumbStructuredData } from '@/components/SEO'
import { createTextExcerpt } from '@/lib/formatText'
import { useAuth } from '@/contexts/AuthContext'

export function JokeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch joke by slug
  const {
    data: baseJoke,
    isLoading: loading,
    error
  } = useJokeBySlug(slug || '')

  // Fetch user vote and favorite for this joke
  const { data: userVotes = [] } = useUserVotes(user?.id || '', baseJoke ? [baseJoke.id] : [])
  const { data: userFavorites = [] } = useUserFavorites(user?.id || '', baseJoke ? [baseJoke.id] : [])

  // Mutations for voting and favoriting
  const voteMutation = useVoteMutation()
  const favoriteMutation = useFavoriteMutation()

  // Combine joke data with user-specific data
  const joke = baseJoke ? {
    ...baseJoke,
    userVote: userVotes?.find(v => v.joke_id === baseJoke.id) || null,
    isFavorite: userFavorites?.some(f => f.joke_id === baseJoke.id) || false
  } : null

  // Redirect to home if joke not found
  useEffect(() => {
    if (slug && baseJoke === undefined) {
      // Still loading
      return
    }
    if (slug && baseJoke === null) {
      navigate('/')
    }
  }, [slug, baseJoke, navigate])

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
                Nie znaleziono dowcipu
              </h3>
              <p className="text-content-muted mb-6">
                Ten dowcip nie istnieje lub został usunięty.
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Powrót do strony głównej
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  if (loading || !joke) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground subheading">Ładowanie dowcipu...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {joke && (
        <SEO
          title={`Dowcip: ${createTextExcerpt(joke.content, 80)}`}
          description={`${createTextExcerpt(joke.content, 160)} - dodany przez ${joke.profiles?.username || 'Anonim'}`}
          canonical={`/dowcip/${joke.slug}`}
          ogType="article"
          structuredData={[
            createJokeStructuredData(joke),
            createBreadcrumbStructuredData([
              { name: 'Strona główna', url: 'https://jokebox.pl' },
              { name: 'Dowcip', url: `https://jokebox.pl/dowcip/${joke.slug}` }
            ])
          ]}
        />
      )}
      <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary hover:text-primary/80 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Powrót</span>
        </button>

        <JokeCard joke={joke} onVoteChange={handleVoteChange} />

        <div className="mt-8 bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-xl font-bold text-foreground mb-4 heading">
            O tym dowcipie
          </h3>
          <div className="space-y-2 text-content-muted">
            <p>
              <span className="font-semibold">Dodane:</span>{' '}
              {new Date(joke.created_at).toLocaleDateString('pl-PL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p>
              <span className="font-semibold">Autor:</span>{' '}
              {joke.profiles?.username || 'Anonim'}
            </p>
            {joke.categories && (
              <p>
                <span className="font-semibold">Kategoria:</span>{' '}
                <button
                  onClick={() => navigate(`/kategoria/${joke.categories!.slug}`)}
                  className="text-primary hover:text-primary/80 hover:underline"
                >
                  {joke.categories.name}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
