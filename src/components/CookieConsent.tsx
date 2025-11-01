import React from 'react'
import CookieConsent from 'react-cookie-consent'

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Akceptuję wszystkie"
      declineButtonText="Odrzuć"
      enableDeclineButton
      cookieName="jokeboxCookieConsent"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #333',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        padding: '20px 30px',
        alignItems: 'center',
        zIndex: 9999
      }}
      buttonStyle={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '8px',
        padding: '12px 24px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        margin: '0 8px'
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#888',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 24px',
        border: '1px solid #555',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        margin: '0 8px'
      }}
      contentStyle={{
        flex: '1',
        color: '#ccc',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 20px 0 0'
      }}
      overlayStyle={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)'
      }}
      disableStyles={false}
      expires={365}
      onAccept={() => {
        // Tutaj można dodać kod do włączenia analytics/reklam
        console.log('Cookie consent accepted')
      }}
      onDecline={() => {
        // Tutaj można dodać kod do wyłączenia analytics/reklam
        console.log('Cookie consent declined')
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <strong>🍪 Ta strona używa ciasteczek</strong>
      </div>
      <div>
        Używamy plików cookie, aby zapewnić najlepsze doświadczenia na naszej stronie.
        Kontynuując przeglądanie, zgadzasz się na naszą{' '}
        <a
          href="/polityka-prywatnosci"
          style={{
            color: '#ff6b35',
            textDecoration: 'underline',
            fontWeight: '500'
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          politykę prywatności
        </a>
        {' '}i{' '}
        <a
          href="/polityka-ciasteczek"
          style={{
            color: '#ff6b35',
            textDecoration: 'underline',
            fontWeight: '500'
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          politykę cookies
        </a>.
      </div>
    </CookieConsent>
  )
}