import { Turnstile } from '@marsidev/react-turnstile'
import { useState, useRef } from 'react'

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  onReset?: () => void
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAB-LSk2v6z47ZXaW'

export function TurnstileCaptcha({ onVerify, onExpire, onError, onReset }: TurnstileCaptchaProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [hasError, setHasError] = useState(false)
  const turnstileRef = useRef<any>(null)

  const handleVerifySuccess = (token: string) => {
    setIsVerified(true)
    setIsExpired(false)
    setHasError(false)
    onVerify(token)
  }

  const handleExpire = () => {
    setIsVerified(false)
    setIsExpired(true)
    setHasError(false)
    onExpire?.()
  }

  const handleError = () => {
    setIsVerified(false)
    setIsExpired(false)
    setHasError(true)
    onError?.()
  }

  const handleReset = () => {
    setIsVerified(false)
    setIsExpired(false)
    setHasError(false)
    turnstileRef.current?.reset()
    onReset?.()
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Weryfikacja antyspamowa
        </label>
        {hasError && (
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Spróbuj ponownie"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-3">
        <div className="w-full flex justify-center">
          <Turnstile
            ref={turnstileRef}
            sitekey={TURNSTILE_SITE_KEY}
            onVerify={handleVerifySuccess}
            onExpire={handleExpire}
            onError={handleError}
            onReset={handleReset}
            options={{
              theme: 'light',
              size: 'normal',
              retry: 'auto',
              'refresh-expired': 'auto'
            }}
          />
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-2">
          {isVerified && (
            <div className="flex items-center space-x-1 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Weryfikacja pomyślna</span>
            </div>
          )}

          {isExpired && !isVerified && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Sesja wygasła</span>
            </div>
          )}

          {hasError && !isVerified && (
            <div className="flex items-center space-x-1 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Błąd weryfikacji</span>
            </div>
          )}

          {!isVerified && !isExpired && !hasError && (
            <div className="text-sm text-gray-500">
              Potwierdź, że nie jesteś robotem
            </div>
          )}
        </div>
      </div>

      {/* Info text */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        Ta weryfikacja pomaga chronić serwis przed spamem i nadużyciami.
      </p>
    </div>
  )
}