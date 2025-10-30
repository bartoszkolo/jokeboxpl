// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { useAuth } from '@/contexts/AuthContext'
import { Trophy } from 'lucide-react'

export function RankingPage() {
  const { user } = useAuth()
  const [jokes, setJokes] = useState<JokeWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    fetchTopJokes()
  }, [timeRange, user])

  const fetchTopJokes = async () => {
    setLoading(true)
    try {
      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        orderBy: 'score',
        ascending: false,
        limit: 50
      })

      // Filter by time range if needed
      let filteredJokes = jokesData
      if (timeRange === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredJokes = jokesData.filter(j => new Date(j.created_at) >= weekAgo)
      } else if (timeRange === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        filteredJokes = jokesData.filter(j => new Date(j.created_at) >= monthAgo)
      }

      if (filteredJokes && user) {
        const jokeIds = filteredJokes.map(j => j.id)
        
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

        const jokesWithUserData = filteredJokes.map(joke => ({
          ...joke,
          userVote: votesData?.find(v => v.joke_id === joke.id) || null,
          isFavorite: favoritesData?.some(f => f.joke_id === joke.id) || false
        }))

        setJokes(jokesWithUserData)
      } else if (filteredJokes) {
        setJokes(filteredJokes)
      }
    } catch (error) {
      console.error('Error fetching top jokes:', error)
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
      fetchTopJokes()
    }
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
            className={`px-4 py-2 rounded-md transition ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Wszystkie czasy
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md transition ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ostatni miesiąc
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md transition ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ostatni tydzień
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Ładowanie rankingu...</p>
          </div>
        ) : jokes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              Brak dowcipów w tym okresie
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jokes.map((joke, index) => (
              <div key={joke.id} className="relative">
                <div className="absolute left-0 top-0 -ml-12 mt-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <JokeCard joke={joke} onVoteChange={handleVoteChange} />
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
