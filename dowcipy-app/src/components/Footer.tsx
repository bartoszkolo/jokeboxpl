// @ts-nocheck
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name, slug')
      .order('name')
    
    if (data) setCategories(data)
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* O nas */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Jokebox</h3>
            <p className="text-sm text-gray-400">
              Najlepsza platforma z polskimi dowcipami. Czytaj, dodawaj i głosuj na swoje ulubione żarty!
            </p>
          </div>

          {/* Kategorie */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Kategorie</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link to={`/kategoria/${category.slug}`} className="text-sm hover:text-white transition">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
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
                <p className="text-sm text-gray-400 mb-3">Śledź nas:</p>
                <div className="flex space-x-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition"
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
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Jokebox. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
