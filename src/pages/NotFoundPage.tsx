import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { SEO } from '@/components/SEO'

export function NotFoundPage() {
  const jokes404 = [
    "Ten dowcip nie istnieje... tak jak twoje szanse na wygraną w totka!",
    "404: Dowcip uciekł w nieznanym kierunku. Może poszedł na kawę?",
    "Szukasz dowcipu? On szuka ciebie, ale wasze drogi się rozminęły.",
    "Błąd 404: Dowcip wziął urlop. Spróbuj ponownie później.",
    "Ten dowcip został już opowiedziany i poszedł na emeryturę.",
    "404: Dowcip zaginął w akcji. Był ostatnio widziany w okolicy przycisku 'Powrót'.",
    "Próbujesz znaleźć dowcip, ale on cię unika. To nie osobiste, to biznes.",
    "Błąd 404: Dowcip jest na wakacjach. Zostawił wiadomość: 'Wrócę nigdy.'"
  ]

  const randomJoke = jokes404[Math.floor(Math.random() * jokes404.length)]

  return (
    <>
      <SEO
        title="Strona nie znaleziona (404) - Jokebox"
        description="Ups! Ta strona nie istnieje. Ale mamy mnóstwo innych świetnych dowcipów, które czekają na ciebie!"
        canonical="/404"
        noindex={true}
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Number with Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                404
              </div>
              <div className="absolute -top-2 -right-2 text-6xl animate-bounce">
                😄
              </div>
            </div>
          </div>

          {/* Funny Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ups! Ten dowcip zaginął w akcji
            </h1>
            <p className="text-xl text-gray-600 mb-4 italic">
              "{randomJoke}"
            </p>
            <p className="text-gray-600">
              Strona której szukasz nie istnieje, ale mamy mnóstwo innych świetnych dowcipów!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Strona główna
            </Link>

            <Link
              to="/losuj"
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <Search className="w-5 h-5 mr-2" />
              Losuj dowcip
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Może ci się spodoba:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/ranking"
                className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-200 group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🏆
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Ranking
                </div>
                <div className="text-xs text-gray-500">
                  Najlepsze dowcipy
                </div>
              </Link>

              <Link
                to="/wyszukiwarka"
                className="p-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-all duration-200 group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Wyszukiwarka
                </div>
                <div className="text-xs text-gray-500">
                  Znajdź dowcip
                </div>
              </Link>

              <Link
                to="/dodaj"
                className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-200 group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Dodaj dowcip
                </div>
                <div className="text-xs text-gray-500">
                  Bądź kreatywny
                </div>
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do poprzedniej strony
            </button>
          </div>

          {/* Easter Egg */}
          <div className="mt-12 text-xs text-gray-400">
            <p>
              Czy wiesz, że 404 to również kod błędu HTTP?
              Teraz już wiesz. Możesz dodać to do swojej kolekcji useless knowledge! 🤓
            </p>
          </div>
        </div>
      </div>
    </>
  )
}