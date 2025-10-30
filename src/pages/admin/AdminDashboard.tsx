import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  MessageSquare,
  Users,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DashboardStats {
  totalJokes: number
  pendingJokes: number
  publishedJokes: number
  rejectedJokes: number
  totalUsers: number
  totalCategories: number
  totalVotes: number
  recentActivity: any[]
  categoryData: any[]
  weeklyData: any[]
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Get basic counts
      const [
        jokesCountResult,
        pendingCountResult,
        publishedCountResult,
        rejectedCountResult,
        usersCountResult,
        categoriesCountResult,
        votesCountResult
      ] = await Promise.all([
        supabase.from('jokes').select('id', { count: 'exact', head: true }),
        supabase.from('jokes').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('jokes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('jokes').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true })
      ])

      // Get recent activity
      const { data: recentJokes } = await supabase
        .from('jokes')
        .select(`
          *,
          author:profiles(username),
          category:categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('username, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      const recentActivity = [
        ...(recentJokes?.map(joke => ({
          type: 'joke',
          title: `Nowy dowcip: ${joke.content.substring(0, 50)}...`,
          author: joke.author?.username || 'Anonim',
          time: new Date(joke.created_at).toLocaleString('pl-PL'),
          status: joke.status
        })) || []),
        ...(recentUsers?.map(user => ({
          type: 'user',
          title: `Nowy użytkownik: ${user.username}`,
          author: user.username,
          time: new Date(user.created_at).toLocaleString('pl-PL'),
          status: 'new'
        })) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

      // Get category data for bar chart
      const { data: categoryData } = await supabase
        .from('jokes')
        .select(`
          categories!inner(name)
        `)
        .eq('status', 'published')

      const categoryCounts = categoryData?.reduce((acc: any, joke: any) => {
        const categoryName = joke.categories.name
        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
      }, {}) || {}

      const categoryChartData = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 categories

      // Get last 7 days data for line chart
      const today = new Date()
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const { data: weeklyData } = await supabase
        .from('jokes')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      const dailyCounts = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
        const dateStr = date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })

        const count = weeklyData?.filter(joke => {
          const jokeDate = new Date(joke.created_at)
          return jokeDate.toDateString() === date.toDateString()
        }).length || 0

        return {
          date: dateStr,
          count: count
        }
      })

      setStats({
        totalJokes: jokesCountResult.count || 0,
        pendingJokes: pendingCountResult.count || 0,
        publishedJokes: publishedCountResult.count || 0,
        rejectedJokes: rejectedCountResult.count || 0,
        totalUsers: usersCountResult.count || 0,
        totalCategories: categoriesCountResult.count || 0,
        totalVotes: votesCountResult.count || 0,
        recentActivity,
        categoryData: categoryChartData,
        weeklyData: dailyCounts
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
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

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nie udało się załadować statystyk panelu
      </div>
    )
  }

  const statCards = [
    {
      title: 'Wszystkie Dowcipy',
      value: stats.totalJokes,
      icon: MessageSquare,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Oczekujące',
      value: stats.pendingJokes,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Opublikowane',
      value: stats.publishedJokes,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Odrzucone',
      value: stats.rejectedJokes,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Użytkownicy',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Kategorie',
      value: stats.totalCategories,
      icon: BarChart3,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Głosy',
      value: stats.totalVotes,
      icon: TrendingUp,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Panel Główny Administratora</h2>
        <p className="text-gray-600">Przegląd statystyk i ostatnia aktywność w systemie</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Jokes by Category */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dowcipy według Kategorii</h3>
          {stats.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#FF6B35"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Brak danych o kategoriach
            </div>
          )}
        </div>

        {/* Line Chart - New Jokes Over 7 Days */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nowe Dowcipy (Ostatnie 7 dni)</h3>
          {stats.weeklyData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Brak nowych dowcipów w ostatnich 7 dniach
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Szybkie Akcje</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/dowcipy?status=pending"
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Sprawdź Oczekujące</div>
              <div className="text-sm text-gray-600">{stats.pendingJokes} dowcipów czeka</div>
            </div>
          </a>

          <a
            href="/admin/dowcipy?action=add"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Dodaj Dowcip</div>
              <div className="text-sm text-gray-600">Stwórz nowy dowcip</div>
            </div>
          </a>

          <a
            href="/admin/kategorie?action=add"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Dodaj Kategorię</div>
              <div className="text-sm text-gray-600">Stwórz nową kategorię</div>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ostatnia Aktywność</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {activity.author} • {activity.time}
                  </div>
                </div>
                <div className="ml-4">
                  {activity.type === 'joke' && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'published' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status === 'published' ? 'Opublikowany' :
                       activity.status === 'pending' ? 'Oczekujący' :
                       activity.status === 'rejected' ? 'Odrzucony' : 'Nowy'}
                    </span>
                  )}
                  {activity.type === 'user' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Nowy Użytkownik
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Brak ostatniej aktywności
          </div>
        )}
      </div>
    </div>
  )
}