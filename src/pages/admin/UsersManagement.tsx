import React, { useState } from 'react'
import {
  Users,
  Crown,
  User,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Trash2
} from 'lucide-react'
import {
  useAdminUsers,
  useToggleUserRoleMutation
} from '@/hooks/useAdmin'

interface UserProfile {
  id: string
  username: string
  is_admin: boolean
  created_at: string
  jokes_count?: number
  last_sign_in_at?: string
}

const USERS_PER_PAGE = 10

export const UsersManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [actionMessage, setActionMessage] = useState('')

  // React Query hooks
  const { data: usersData, isLoading: loading, error: usersError } = useAdminUsers({
    search: searchQuery,
    role: roleFilter,
    page: currentPage
  })

  // Mutations
  const toggleUserRoleMutation = useToggleUserRoleMutation()

  const users = usersData?.users || []
  const totalCount = usersData?.totalCount || 0
  const totalPages = usersData?.totalPages || 0

  const toggleAdminRole = async (userId: string, currentRole: boolean) => {
    try {
      await toggleUserRoleMutation.mutateAsync({ userId, isAdmin: currentRole })

      setActionMessage(
        currentRole
          ? 'Użytkownik stracił uprawnienia admina'
          : 'Nadano uprawnienia admina'
      )

      setTimeout(() => setActionMessage(''), 3000)
    } catch (error) {
      console.error('Error updating user role:', error)
      setActionMessage('Nie udało się zaktualizować roli użytkownika')
      setTimeout(() => setActionMessage(''), 3000)
    }
  }

  const deleteUser = async (user: UserProfile) => {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika "${user.username}"? Ta operacja jest nieodwracalna.`)) {
      return
    }

    try {
      // This is a complex operation - in a real app you'd want to handle this more carefully
      // For now, we'll just show a warning message
      setActionMessage('Usuwanie użytkowników wymaga dodatkowej implementacji ze względów bezpieczeństwa')
      setTimeout(() => setActionMessage(''), 5000)
    } catch (error) {
      console.error('Error deleting user:', error)
      setActionMessage('Nie udało się usunąć użytkownika')
      setTimeout(() => setActionMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">Wystąpił błąd podczas ładowania użytkowników. Spróbuj odświeżyć stronę.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Użytkownikami</h2>
          <p className="text-gray-600">Zarządzanie rolami i uprawnieniami użytkowników</p>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className={`rounded-lg p-4 ${
          actionMessage.includes('nie udało się') || actionMessage.includes('wymaga')
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            {actionMessage.includes('nie udało się') || actionMessage.includes('wymaga') ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
            )}
            <p className={`${
              actionMessage.includes('nie udało się') || actionMessage.includes('wymaga')
                ? 'text-yellow-800'
                : 'text-green-800'
            }`}>
              {actionMessage}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Szukaj Użytkownika</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Nazwa użytkownika..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtruj Rolę</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">Wszyscy Użytkownicy</option>
              <option value="admin">Tylko Admini</option>
              <option value="user">Tylko Zwykli Użytkownicy</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Pokazano {users.length} z {totalCount} użytkowników
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Użytkownik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dowcipy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Rejestracji
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ostatnie Logowanie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.is_admin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <User className="h-3 w-3 mr-1" />
                            Użytkownik
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.jokes_count} dowcipów
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(user.created_at).toLocaleDateString('pl-PL')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.last_sign_in_at ? (
                        <div className="text-sm text-gray-500">
                          {new Date(user.last_sign_in_at).toLocaleDateString('pl-PL')}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Nigdy</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAdminRole(user.id, user.is_admin)}
                          disabled={toggleUserRoleMutation.isPending}
                          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            user.is_admin
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {toggleUserRoleMutation.isPending ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : user.is_admin ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {user.is_admin ? 'Odbierz Admina' : 'Nadaj Admina'}
                        </button>

                        <button
                          onClick={() => deleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Usuń użytkownika"
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
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak użytkowników
            </h3>
            <p className="text-gray-600">
              Nie znaleziono użytkowników pasujących do kryteriów wyszukiwania.
            </p>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wszyscy Użytkownicy</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administratorzy</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_admin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Zwykli Użytkownicy</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.is_admin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nowi Użytkownicy</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const createdAt = new Date(u.created_at)
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return createdAt > thirtyDaysAgo
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}