import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Plus, Crown, Shuffle } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function Navbar() {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-2xl font-bold text-gradient">Jokebox</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/" className="ui-text hover:text-primary px-3 py-2 rounded-md transition-colors duration-200">
                Wszystkie
              </Link>
              <Link to="/losuj" className="ui-text hover:text-primary px-3 py-2 rounded-md transition-colors duration-200 flex items-center space-x-1">
                <Shuffle className="h-4 w-4" />
                <span>Losuj</span>
              </Link>
              <Link to="/ranking" className="ui-text hover:text-primary px-3 py-2 rounded-md transition-colors duration-200">
                Ranking
              </Link>
              {user && (
                <Link to="/ulubione" className="ui-text hover:text-primary px-3 py-2 rounded-md transition-colors duration-200">
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
                    className="flex items-center space-x-1 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent-dark transition-all duration-200 shadow-sm hover:shadow-md"
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
                <div className="flex items-center space-x-2 ui-text meta-text">
                  <User size={18} />
                  <span className="hidden sm:inline">{profile?.username}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 ui-text meta-text hover:text-destructive transition-colors duration-200"
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
