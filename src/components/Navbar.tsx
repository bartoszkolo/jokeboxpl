import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Plus, Crown, Shuffle, ChevronDown, Settings } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <nav className="bg-orange-600 backdrop-blur-sm border-b border-orange-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-2xl font-bold text-white">Jokebox</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/losuj" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md transition-colors duration-200 flex items-center space-x-1">
                <Shuffle className="h-4 w-4" />
                <span>Losuj</span>
              </Link>
              <Link to="/ranking" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md transition-colors duration-200">
                Ranking
              </Link>
              {user && (
                <Link to="/ulubione" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md transition-colors duration-200">
                  Ulubione
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                {profile?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 bg-orange-800 text-white px-4 py-2 rounded-lg hover:bg-orange-900 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Crown size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/dodaj"
                  className="btn-primary flex items-center space-x-1"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Dodaj dowcip</span>
                </Link>
                <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-orange-600 font-medium text-sm">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-white">{profile?.username}</div>
                    <div className="text-xs text-orange-100">
                      {profile?.is_admin ? 'Administrator' : 'Użytkownik'}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-orange-100 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-orange-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-orange-200">
                      <p className="text-sm font-medium text-gray-800">{profile?.username}</p>
                      <p className="text-xs text-gray-600">
                        {profile?.is_admin ? 'Administrator' : 'Użytkownik'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        signOut()
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors duration-200"
                    >
                      <LogOut size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-600 hover:text-gray-800">Wyloguj</span>
                    </button>
                  </div>
                )}

                {/* Close dropdown when clicking outside */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>
              </>
            ) : (
              <Link
                to="/logowanie"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Zaloguj się
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
