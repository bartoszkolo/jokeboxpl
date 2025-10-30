import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Tag
} from 'lucide-react'

interface Joke {
  id: number
  content: string
  status: 'pending' | 'published' | 'rejected'
  slug: string
  upvotes: number
  downvotes: number
  score: number
  created_at: string
  updated_at: string
  author?: {
    username: string
  }
  category?: {
    name: string
    slug: string
  }
}

interface Category {
  id: number
  name: string
  slug: string
}

const JOKES_PER_PAGE = 10

export const JokesManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [jokes, setJokes] = useState<Joke[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all')
  const [authorFilter, setAuthorFilter] = useState(searchParams.get('author') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  // Modal states
  const [editingJoke, setEditingJoke] = useState<Joke | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newJokeContent, setNewJokeContent] = useState('')
  const [newJokeCategory, setNewJokeCategory] = useState('')
  const [newJokeStatus, setNewJokeStatus] = useState<'pending' | 'published'>('published')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchJokes()
  }, [statusFilter, categoryFilter, authorFilter, sortBy, sortOrder, currentPage, searchQuery])

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (categoryFilter !== 'all') params.set('category', categoryFilter)
    if (authorFilter) params.set('author', authorFilter)
    if (searchQuery) params.set('search', searchQuery)
    params.set('sort', sortBy)
    params.set('order', sortOrder)
    params.set('page', currentPage.toString())
    setSearchParams(params)
  }, [statusFilter, categoryFilter, authorFilter, sortBy, sortOrder, currentPage, searchQuery])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchJokes = async () => {
    setLoading(true)
    try {
      // Simplified query first to avoid RLS issues with profiles join
      let query = supabase
        .from('jokes')
        .select(`
          *,
          category:categories(name, slug)
        `, { count: 'exact' })

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', parseInt(categoryFilter))
      }
      // Removed author filter due to RLS issues with profiles table
      // if (authorFilter) {
      //   query = query.eq('author.username', authorFilter)
      // }
      if (searchQuery) {
        query = query.ilike('content', `%${searchQuery}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (currentPage - 1) * JOKES_PER_PAGE
      const to = from + JOKES_PER_PAGE - 1
      query = query.range(from, to)

      const { data, count, error } = await query

      if (error) throw error

      setJokes(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching jokes:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateJokeStatus = async (jokeId: number, newStatus: 'published' | 'rejected') => {
    try {
      await supabase
        .from('jokes')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jokeId)

      setJokes(jokes.map(joke =>
        joke.id === jokeId ? { ...joke, status: newStatus } : joke
      ))
    } catch (error) {
      console.error('Error updating joke status:', error)
    }
  }

  const deleteJoke = async (jokeId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dowcip? Ta operacja jest nieodwracalna.')) {
      return
    }

    try {
      await supabase.from('jokes').delete().eq('id', jokeId)
      setJokes(jokes.filter(joke => joke.id !== jokeId))
    } catch (error) {
      console.error('Error deleting joke:', error)
    }
  }

  const saveEditedJoke = async () => {
    if (!editingJoke) return

    try {
      await supabase
        .from('jokes')
        .update({
          content: editingJoke.content,
          category_id: editingJoke.category ?
            categories.find(c => c.name === editingJoke.category.name)?.id : null,
          status: editingJoke.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingJoke.id)

      setEditingJoke(null)
      fetchJokes()
    } catch (error) {
      console.error('Error saving joke:', error)
    }
  }

  const addNewJoke = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Musisz być zalogowany aby dodać dowcip')
        return
      }

      // Generate slug
      const slug = newJokeContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now()

      await supabase.from('jokes').insert({
        content: newJokeContent,
        category_id: newJokeCategory ? parseInt(newJokeCategory) : null,
        status: newJokeStatus,
        slug,
        author_id: user.id
      })

      setNewJokeContent('')
      setNewJokeCategory('')
      setNewJokeStatus('published')
      setShowAddModal(false)
      fetchJokes()
    } catch (error) {
      console.error('Error adding joke:', error)
      alert('Wystąpił błąd podczas dodawania dowcipu. Spróbuj ponownie.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return baseClasses
    }
  }

  const totalPages = Math.ceil(totalCount / JOKES_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Dowcipami</h2>
          <p className="text-gray-600">Moderacja i edycja wszystkich dowcipów w systemie</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj Dowcip
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">Wszystkie</option>
              <option value="pending">Oczekujące</option>
              <option value="published">Opublikowane</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">Wszystkie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <input
              type="text"
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Nazwa autora"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Szukaj</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Szukaj w treści..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortuj</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="created_at">Data dodania</option>
              <option value="score">Score</option>
              <option value="upvotes">Głosy pozytywne</option>
              <option value="content">Treść</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Pokazano {jokes.length} z {totalCount} dowcipów
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Kolejność: {sortOrder === 'asc' ? 'Rosnąca' : 'Malejąca'}
          </button>
        </div>
      </div>

      {/* Jokes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : jokes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treść
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statystyki
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jokes.map((joke) => (
                  <tr key={joke.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {joke.content}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(joke.status)}
                        <span className={getStatusBadge(joke.status)}>
                          {joke.status === 'published' ? 'Opublikowany' :
                           joke.status === 'pending' ? 'Oczekujący' : 'Odrzucony'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        Anonim
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {joke.category ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Tag className="h-4 w-4 mr-1 text-gray-400" />
                          {joke.category.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Brak</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="flex items-center text-green-600">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {joke.upvotes}
                        </div>
                        <div className="flex items-center text-red-600">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {joke.downvotes}
                        </div>
                        <div className="font-medium text-gray-900">
                          {joke.score}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(joke.created_at).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {joke.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateJokeStatus(joke.id, 'published')}
                              className="text-green-600 hover:text-green-900"
                              title="Zatwierdź"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateJokeStatus(joke.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Odrzuć"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setEditingJoke(joke)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteJoke(joke.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Brak dowcipów do wyświetlenia
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Strona {currentPage} z {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingJoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edytuj Dowcip</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treść</label>
                <textarea
                  value={editingJoke.content}
                  onChange={(e) => setEditingJoke({...editingJoke, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingJoke.status}
                  onChange={(e) => setEditingJoke({...editingJoke, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="pending">Oczekujący</option>
                  <option value="published">Opublikowany</option>
                  <option value="rejected">Odrzucony</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                <select
                  value={categories.find(c => c.name === editingJoke.category?.name)?.id || ''}
                  onChange={(e) => {
                    const category = categories.find(c => c.id === parseInt(e.target.value))
                    setEditingJoke({...editingJoke, category})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Brak kategorii</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingJoke(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={saveEditedJoke}
                className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj Nowy Dowcip</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treść</label>
                <textarea
                  value={newJokeContent}
                  onChange={(e) => setNewJokeContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                  placeholder="Wpisz treść dowcipu..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newJokeStatus}
                  onChange={(e) => setNewJokeStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="published">Opublikowany</option>
                  <option value="pending">Oczekujący</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                <select
                  value={newJokeCategory}
                  onChange={(e) => setNewJokeCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Brak kategorii</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewJokeContent('')
                  setNewJokeCategory('')
                  setNewJokeStatus('published')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={addNewJoke}
                disabled={!newJokeContent.trim()}
                className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}