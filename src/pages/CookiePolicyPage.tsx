import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Shield, Cookie, Eye, Lock, FileText } from 'lucide-react'

export function CookiePolicyPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO
        title="Polityka Ciasteczek - Jokebox.pl"
        description="Polityka plików cookies Jokebox.pl - dowiedz się jak używamy ciasteczek na naszej stronie z dowcipami."
      />
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cookie className="text-primary" size={40} />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4 heading">
                Polityka Plików Cookies
              </h1>
              <p className="text-muted-foreground text-lg">
                Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {/* Czym są cookies */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Cookie className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Czym są pliki cookies?
                  </h2>
                </div>
                <p className="text-content-muted leading-relaxed">
                  Pliki cookies (ciasteczka) to małe pliki tekstowe, które są przechowywane na Twoim urządzeniu
                  (komputerze, telefonie, tablecie) podczas przeglądania stron internetowych. Służą do
                  zapamiętywania Twoich preferencji i ułatwienia korzystania ze strony.
                </p>
              </section>

              {/* Rodzaje cookies */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Jakie rodzaje plików cookies używamy?
                  </h2>
                </div>

                <div className="grid gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Konieczne (essential)</h3>
                    <p className="text-content-muted text-sm">
                      Niezbędne do prawidłowego funkcjonowania strony - uwierzytelnianie, koszyk,
                      zarządzanie sesją.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Wydajnościowe (performance)</h3>
                    <p className="text-content-muted text-sm">
                      Pomagają zrozumieć, jak odwiedzający korzystają ze strony, poprzez zbieranie
                      i raportowanie informacji anonimowo.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Funkcjonalne (functional)</h3>
                    <p className="text-content-muted text-sm">
                      Umożliwiają zapamiętywanie Twoich wyborów (np. nazwa użytkownika, język, region).
                    </p>
                  </div>
                </div>
              </section>

              {/* Jak używamy cookies */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Eye className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Jak używamy plików cookies na Jokebox.pl?
                  </h2>
                </div>

                <ul className="space-y-2 text-content-muted">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Do uwierzytelniania użytkowników i utrzymywania sesji logowania</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Do zapamiętywania Twoich preferencji (ulubione dowcipy, głosy)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Do analizy ruchu na stronie i poprawy jakości usług</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Do zapewnienia bezpieczeństwa serwisu</span>
                  </li>
                </ul>
              </section>

              {/* Zarządzanie cookies */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Lock className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Jak zarządzać plikami cookies?
                  </h2>
                </div>

                <p className="text-content-muted mb-4">
                  Możesz w każdej chwili zmienić ustawienia plików cookies poprzez:
                </p>

                <ul className="space-y-2 text-content-muted mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Nasz baner ciasteczek wyświetlany przy pierwszej wizycie</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Ustawienia przeglądarki internetowej</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Ustawienia urządzenia mobilnego</span>
                  </li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Uwaga:</strong> Wyłączenie niektórych plików cookies może wpłynąć na
                    funkcjonalność i wygodę korzystania ze strony.
                  </p>
                </div>
              </section>

              {/* Kontakt */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Masz pytania?
                  </h2>
                </div>

                <p className="text-content-muted mb-4">
                  Jeśli masz jakiekolwiek pytania dotyczące naszej polityki cookies,
                  skontaktuj się z nami:
                </p>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-content-muted">
                    Email: privacy@jokebox.pl<br />
                    Temat: Polityka Cookies
                  </p>
                </div>
              </section>
            </div>

            {/* Back button */}
            <div className="mt-12 text-center">
              <button
                onClick={() => navigate(-1)}
                className="btn-primary"
              >
                Wróć do poprzedniej strony
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}