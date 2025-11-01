import React, { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Tags,
  Users,
  ChevronRight,
  Crown,
  Menu,
  X
} from 'lucide-react'

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Debug: log state changes
  React.useEffect(() => {
    console.log('Sidebar collapsed state:', isCollapsed)
  }, [isCollapsed])

  const menuItems = [
    {
      title: 'Panel Główny',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Przegląd statystyk'
    },
    {
      title: 'Zarządzanie Dowcipami',
      href: '/admin/dowcipy',
      icon: MessageSquare,
      description: 'Moderacja i edycja dowcipów'
    },
    {
      title: 'Zarządzanie Kategoriami',
      href: '/admin/kategorie',
      icon: Tags,
      description: 'CRUD kategorii'
    },
    {
      title: 'Zarządzanie Użytkownikami',
      href: '/admin/uzytkownicy',
      icon: Users,
      description: 'Zarządzanie rolami użytkowników'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-accent to-accent-dark border-b border-accent-dark shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-accent-foreground mr-3" />
              <h1 className="text-xl font-bold text-accent-foreground font-ui hidden sm:block">Panel Administratora</h1>
              <h1 className="text-lg font-bold text-accent-foreground font-ui sm:hidden">Admin</h1>
            </div>
            <button
              onClick={() => {
                console.log('Toggle clicked, current state:', isCollapsed)
                setIsCollapsed(!isCollapsed)
              }}
              className="flex items-center justify-center px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent-foreground transition-all duration-200 border border-accent/20 hover:border-accent/30 text-sm"
              title={isCollapsed ? "Rozwiń panel boczny" : "Zwiń panel boczny"}
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className={`grid gap-6 transition-all duration-300 h-full ${
          isCollapsed
            ? 'grid-cols-12'
            : 'grid-cols-12'
        }`}>
          {/* Sidebar */}
          <div className={`${isCollapsed ? 'col-span-1' : 'col-span-3'} transition-all duration-300 ease-in-out`}>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`group relative flex items-center ${isCollapsed ? 'justify-center px-3 py-4' : 'px-4 py-3'} text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-accent/10 text-accent shadow-sm border-l-4 border-accent'
                        : 'text-content-muted hover:bg-muted/50 hover:text-foreground'
                    }`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={`${
                      isCollapsed ? '' : 'mr-3'
                    } h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                      isCollapsed ? 'group-hover:scale-110' : ''
                    }`} />

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}

                    {!isCollapsed && (
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-content-light mt-0.5">{item.description}</div>
                      </div>
                    )}
                    {!isCollapsed && active && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className={`${
            isCollapsed
              ? 'col-span-11'
              : 'col-span-9'
          } transition-all duration-300 ease-in-out`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}