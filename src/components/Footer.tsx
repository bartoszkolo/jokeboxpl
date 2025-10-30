// @ts-nocheck
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-orange-900 text-orange-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* O nas */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/jokebox_logo.png" alt="Jokebox" className="h-8 w-8" />
              <h3 className="text-white text-lg font-bold">Jokebox</h3>
            </div>
            <p className="text-sm text-orange-200 text-center md:text-left">
              Najlepsza platforma z polskimi dowcipami. Czytaj, dodawaj i głosuj na swoje ulubione żarty!
            </p>
          </div>

          {/* Nawigacja */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Nawigacja</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-white transition">
                  Wszystkie dowcipy
                </Link>
              </li>
              <li>
                <Link to="/ranking" className="text-sm hover:text-white transition">
                  Ranking
                </Link>
              </li>
              <li>
                <Link to="/dodaj" className="text-sm hover:text-white transition">
                  Dodaj dowcip
                </Link>
              </li>
              <li>
                <Link to="/regulamin" className="text-sm hover:text-white transition">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link to="/polityka-prywatnosci" className="text-sm hover:text-white transition">
                  Polityka Prywatności
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt i Social Media */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Kontakt</h3>
            <div className="space-y-4">
              <a
                href="mailto:kontakt@jokebox.pl"
                className="flex items-center space-x-2 text-sm hover:text-white transition"
              >
                <Mail size={16} />
                <span>kontakt@jokebox.pl</span>
              </a>

              <div className="pt-2">
                <p className="text-sm text-orange-200 mb-3">Śledź nas:</p>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-400 transition"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-300 transition"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-400 transition"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-orange-800 mt-8 pt-8 text-center">
          <p className="text-sm text-orange-200">
            © {currentYear} Jokebox. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
