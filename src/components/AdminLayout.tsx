import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Tags,
  Users,
  ChevronRight,
  Crown
} from 'lucide-react'

export const AdminLayout: React.FC = () => {
  const location = useLocation()

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
      <div className="bg-yellow-400 border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Crown className="h-8 w-8 text-yellow-900 mr-3" />
            <h1 className="text-xl font-bold text-yellow-900">Panel Administratora</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      active
                        ? 'bg-yellow-100 text-yellow-900 border-l-4 border-yellow-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    {active && <ChevronRight className="h-4 w-4" />}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}