// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { Heart } from 'lucide-react'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/logowanie')
      return
    }
    fetchFavorites()
  }, [user, navigate])

  const fetchFavorites = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: favorites } = await supabase
        .from('favorites')
        .select('joke_id')
        .eq('user_id', user.id)

      if (!favorites || favorites.length === 0) {
        setJokes([])
        setLoading(false)
        return
      }

      const jokeIds = favorites.map(f => f.joke_id)

      // Fetch all jokes first
      const allJokes = await fetchJokesWithDetails({
        status: 'published',
        limit: 1000
      })

      // Filter to only favorite jokes
      const jokesData = allJokes.filter(j => jokeIds.includes(j.id))

      if (jokesData) {
        const { data: votesData } = await supabase
          .from('votes')
          .select('*')
          .eq('user_id', user.id)
          .in('joke_id', jokeIds)

        const jokesWithUserData = jokesData.map(joke => ({
          ...joke,
          userVote: votesData?.find(v => v.joke_id === joke.id) || null,
          isFavorite: true
        }))

        setJokes(jokesWithUserData)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
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
      fetchFavorites()
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="text-red-500" size={36} fill="currentColor" />
            <h1 className="text-4xl font-bold text-gradient heading">
              Twoje ulubione dowcipy
            </h1>
          </div>
          <p className="text-content-muted subheading">
            Dowcipy, które oznaczyłeś jako ulubione
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Ładowanie ulubionych...</p>
          </div>
        ) : jokes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Heart className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-600 text-lg mb-4">
              Nie masz jeszcze żadnych ulubionych dowcipów
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
            >
              Przeglądaj dowcipy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jokes.map(joke => (
              <JokeCard key={joke.id} joke={joke} onVoteChange={handleVoteChange} />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
