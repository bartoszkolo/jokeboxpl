// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor } from '@/types/database'
import { JokeCard } from '@/components/JokeCard'
import { SEO, createJokeStructuredData, createBreadcrumbStructuredData } from '@/components/SEO'
import { useAuth } from '@/contexts/AuthContext'

export function JokeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [joke, setJoke] = useState<JokeWithAuthor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchJoke()
    }
  }, [slug, user])

  const fetchJoke = async () => {
    if (!slug) return

    setLoading(true)
    try {
      // Fetch all published jokes and find by slug
      const allJokes = await fetchJokesWithDetails({
        status: 'published',
        limit: 1000
      })

      const jokeData = allJokes.find(j => j.slug === slug)

      if (!jokeData) {
        navigate('/')
        return
      }

      if (user) {
        const [{ data: voteData }, { data: favoriteData }] = await Promise.all([
          supabase
            .from('votes')
            .select('*')
            .eq('user_id', user.id)
            .eq('joke_id', jokeData.id)
            .single(),
          supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('joke_id', jokeData.id)
            .single()
        ])

        setJoke({
          ...jokeData,
          userVote: voteData || null,
          isFavorite: !!favoriteData
        })
      } else {
        setJoke(jokeData)
      }
    } catch (error) {
      console.error('Error fetching joke:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!joke) {
    return null
  }

  return (
    <>
      {joke && (
        <SEO
          title={`Dowcip: ${joke.content.substring(0, 80)}...`}
          description={`${joke.content.substring(0, 160)}${joke.content.length > 160 ? '...' : ''} - dodany przez ${joke.author.username}`}
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
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Powrót</span>
        </button>

        <JokeCard joke={joke} onVoteChange={fetchJoke} />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            O tym dowcipie
          </h3>
          <div className="space-y-2 text-gray-700">
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
                  className="text-blue-600 hover:underline"
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
