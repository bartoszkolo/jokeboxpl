import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { SEO, createWebsiteStructuredData } from './components/SEO'
import { AdminRoute } from './components/AdminRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PageLoading } from './components/LoadingSpinner'
import { TermsOfService } from './components/TermsOfService'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { TextFormattingTest } from './components/TextFormattingTest'
import { useEffect } from 'react'

// Lazy loaded page components
const HomePage = () => import('./pages/HomePage').then(module => ({ default: module.HomePage }))
const LoginPage = () => import('./pages/LoginPage').then(module => ({ default: module.LoginPage }))
const RegisterPage = () => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage }))
const AddJokePage = () => import('./pages/AddJokePage').then(module => ({ default: module.AddJokePage }))
const RankingPage = () => import('./pages/RankingPage').then(module => ({ default: module.RankingPage }))
const FavoritesPage = () => import('./pages/FavoritesPage').then(module => ({ default: module.FavoritesPage }))
const JokeDetailPage = () => import('./pages/JokeDetailPage').then(module => ({ default: module.JokeDetailPage }))
const CategoryPage = () => import('./pages/CategoryPage').then(module => ({ default: module.CategoryPage }))
const RandomJokePage = () => import('./pages/RandomJokePage').then(module => ({ default: module.RandomJokePage }))
const SearchPage = () => import('./pages/SearchPage').then(module => ({ default: module.default }))
const NotFoundPage = () => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage }))

// Lazy loaded admin components
const AdminLayout = () => import('./components/AdminLayout').then(module => ({ default: module.AdminLayout }))
const AdminDashboard = () => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard }))
const JokesManagement = () => import('./pages/admin/JokesManagement').then(module => ({ default: module.JokesManagement }))
const CategoriesManagement = () => import('./pages/admin/CategoriesManagement').then(module => ({ default: module.CategoriesManagement }))
const UsersManagement = () => import('./pages/admin/UsersManagement').then(module => ({ default: module.UsersManagement }))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
          <div className="min-h-screen bg-background text-foreground transition-safe flex flex-col">
            <SEO
              structuredData={createWebsiteStructuredData()}
            />
            <Navbar />
            <main className="flex-grow">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Suspense fallback={<PageLoading />}><HomePage /></Suspense>} />
              <Route path="/wyszukiwarka" element={<Suspense fallback={<PageLoading />}><SearchPage /></Suspense>} />
              <Route path="/losuj" element={<Suspense fallback={<PageLoading />}><RandomJokePage /></Suspense>} />
              <Route path="/logowanie" element={<Suspense fallback={<PageLoading />}><LoginPage /></Suspense>} />
              <Route path="/rejestracja" element={<Suspense fallback={<PageLoading />}><RegisterPage /></Suspense>} />
              <Route path="/dodaj" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><AddJokePage /></Suspense></ProtectedRoute>} />
              <Route path="/ranking" element={<Suspense fallback={<PageLoading />}><RankingPage /></Suspense>} />
              <Route path="/ulubione" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><FavoritesPage /></Suspense></ProtectedRoute>} />
              <Route path="/dowcip/:slug" element={<Suspense fallback={<PageLoading />}><JokeDetailPage /></Suspense>} />
              <Route path="/kategoria/:slug" element={<Suspense fallback={<PageLoading />}><CategoryPage /></Suspense>} />
              <Route path="/regulamin" element={<TermsOfService />} />
              <Route path="/polityka-prywatnosci" element={<PrivacyPolicy />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminLayout /></Suspense></AdminRoute>}>
                <Route index element={<Suspense fallback={<PageLoading />}><AdminDashboard /></Suspense>} />
                <Route path="dowcipy" element={<Suspense fallback={<PageLoading />}><JokesManagement /></Suspense>} />
                <Route path="kategorie" element={<Suspense fallback={<PageLoading />}><CategoriesManagement /></Suspense>} />
                <Route path="uzytkownicy" element={<Suspense fallback={<PageLoading />}><UsersManagement /></Suspense>} />
                <Route path="test-formatowania" element={<TextFormattingTest />} />
              </Route>

              {/* 404 Catch-all Route */}
              <Route path="*" element={<Suspense fallback={<PageLoading />}><NotFoundPage /></Suspense>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
