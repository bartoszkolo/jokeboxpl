// @ts-nocheck
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { JokeCard } from '@/components/JokeCard'
import { Loader2, Search as SearchIcon } from 'lucide-react'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [jokes, setJokes] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('relevance')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (query) {
      searchJokes()
      countResults()
    } else {
      setJokes([])
      setTotalCount(0)
    }
  }, [query, selectedCategory, sortBy])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
    
    if (data) setCategories(data)
  }

  const searchJokes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_jokes', {
        search_query: query,
        p_category_id: selectedCategory,
        p_limit: 50,
        p_offset: 0,
        p_order_by: sortBy
      })

      if (error) {
        console.error('Search error:', error)
        setJokes([])
      } else {
        setJokes(data || [])
      }
    } catch (err) {
      console.error('Search error:', err)
      setJokes([])
    } finally {
      setLoading(false)
    }
  }

  const countResults = async () => {
    try {
      const { data, error } = await supabase.rpc('count_search_results', {
        search_query: query,
        p_category_id: selectedCategory
      })

      if (!error && data !== null) {
        setTotalCount(data)
      }
    } catch (err) {
      console.error('Count error:', err)
    }
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <SearchIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Wyszukaj dowcipy
            </h2>
            <p className="text-gray-600">
              Użyj wyszukiwarki w górnej części strony, aby znaleźć interesujące Cię dowcipy.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Nagłówek */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wyniki wyszukiwania
          </h1>
          <p className="text-gray-600">
            Znaleziono <span className="font-semibold">{totalCount}</span> dowcipów dla zapytania: 
            <span className="font-semibold"> "{query}"</span>
          </p>
        </div>

        {/* Filtry */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtr kategorii */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoria
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sortowanie
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : jokes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jokes.map((joke) => (
              <JokeCard key={joke.id} joke={joke} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Brak wyników
            </h2>
            <p className="text-gray-600 mb-4">
              Nie znaleziono dowcipów pasujących do Twojego zapytania.
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Powrót do strony głównej
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
