import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'

interface Joke {
  id: number
  content: string
  status: 'pending' | 'published' | 'rejected'
  created_at: string
}

export const SafeJokesManagement: React.FC = () => {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJokes()
  }, [])

  const fetchJokes = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching jokes...')

      // Simple query first to test connection
      const { data, error } = await supabase
        .from('jokes')
        .select('id, content, status, created_at')
        .limit(5)

      console.log('Response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setJokes(data || [])
    } catch (err) {
      console.error('Error in fetchJokes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch jokes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Jokes</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchJokes}
          className="flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Dowcipami (Safe Mode)</h2>
        <p className="text-gray-600">Debug version with error handling</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">Successfully loaded {jokes.length} jokes!</p>
      </div>

      {jokes.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jokes.map((joke) => (
                <tr key={joke.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {joke.content}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      joke.status === 'published' ? 'bg-green-100 text-green-800' :
                      joke.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {joke.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(joke.created_at).toLocaleDateString('pl-PL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>No jokes found in database</p>
        </div>
      )}
    </div>
  )
}