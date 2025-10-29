import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Plus, Crown } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function Navbar() {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">Jokebox</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                Wszystkie
              </Link>
              <Link to="/ranking" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                Ranking
              </Link>
              {user && (
                <Link to="/ulubione" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
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
                    className="flex items-center space-x-1 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                  >
                    <Crown size={18} />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/dodaj"
                  className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Dodaj dowcip</span>
                </Link>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={18} />
                  <span className="hidden sm:inline">{profile?.username}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Wyloguj</span>
                </button>
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
