import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { SEO, createWebsiteStructuredData } from './components/SEO'
import { AdminRoute } from './components/AdminRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AddJokePage } from './pages/AddJokePage'
import { RankingPage } from './pages/RankingPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { AdminPage } from './pages/AdminPage'
import { JokeDetailPage } from './pages/JokeDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import { RandomJokePage } from './pages/RandomJokePage'
import SearchPage from './pages/SearchPage'
import { TermsOfService } from './components/TermsOfService'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { NotFoundPage } from './pages/NotFoundPage'
import { TextFormattingTest } from './components/TextFormattingTest'
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { JokesManagement } from './pages/admin/JokesManagement'
import { CategoriesManagement } from './pages/admin/CategoriesManagement'
import { UsersManagement } from './pages/admin/UsersManagement'
import { SafeJokesManagement } from './pages/admin/SafeJokesManagement'
import { SafeUsersManagement } from './pages/admin/SafeUsersManagement'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/wyszukiwarka" element={<SearchPage />} />
              <Route path="/losuj" element={<RandomJokePage />} />
              <Route path="/logowanie" element={<LoginPage />} />
              <Route path="/rejestracja" element={<RegisterPage />} />
              <Route path="/dodaj" element={<AddJokePage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/ulubione" element={<FavoritesPage />} />
              <Route path="/dowcip/:slug" element={<JokeDetailPage />} />
              <Route path="/kategoria/:slug" element={<CategoryPage />} />
              <Route path="/regulamin" element={<TermsOfService />} />
              <Route path="/polityka-prywatnosci" element={<PrivacyPolicy />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dowcipy" element={<JokesManagement />} />
                <Route path="kategorie" element={<CategoriesManagement />} />
                <Route path="uzytkownicy" element={<UsersManagement />} />
                <Route path="test-formatowania" element={<TextFormattingTest />} />
              </Route>

              {/* 404 Catch-all Route */}
              <Route path="*" element={<NotFoundPage />} />
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
