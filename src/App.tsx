import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AddJokePage } from './pages/AddJokePage'
import { RankingPage } from './pages/RankingPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { AdminPage } from './pages/AdminPage'
import { JokeDetailPage } from './pages/JokeDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import { TermsOfService } from './components/TermsOfService'
import { PrivacyPolicy } from './components/PrivacyPolicy'

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
              <Route path="/logowanie" element={<LoginPage />} />
              <Route path="/rejestracja" element={<RegisterPage />} />
              <Route path="/dodaj" element={<AddJokePage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/ulubione" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/dowcip/:slug" element={<JokeDetailPage />} />
              <Route path="/kategoria/:slug" element={<CategoryPage />} />
              <Route path="/regulamin" element={<TermsOfService />} />
              <Route path="/polityka-prywatnosci" element={<PrivacyPolicy />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
