import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
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
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { JokesManagement } from './pages/admin/JokesManagement'
import { CategoriesManagement } from './pages/admin/CategoriesManagement'
import { UsersManagement } from './pages/admin/UsersManagement'
import { SafeJokesManagement } from './pages/admin/SafeJokesManagement'
import { SafeUsersManagement } from './pages/admin/SafeUsersManagement'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
