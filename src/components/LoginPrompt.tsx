import { useState } from 'react'
import { X, LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LoginPromptProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function LoginPrompt({ isOpen, onClose, message = "Aby korzystać z tej funkcji, musisz być zalogowany" }: LoginPromptProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-2">
            Wymagane logowanie
          </h3>

          <p className="text-muted-foreground mb-6">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/logowanie"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Zaloguj się
            </Link>

            <Link
              to="/rejestracja"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Załóż konto
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Nie masz jeszcze konta? Rejestracja zajmuje tylko chwilę!
          </p>
        </div>
      </div>
    </div>
  )
}