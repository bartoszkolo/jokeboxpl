import React, { useEffect, useRef } from 'react'
import { GoogleAdSenseProps, ADSENSE_CONFIG } from '@/types/adsense'

export function GoogleAdSense({
  adSlot,
  adFormat = 'auto',
  className = '',
  style = { display: 'block' },
  responsive = true,
  adLabel = 'Reklama'
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    try {
      if (window.adsbygoogle && adRef.current) {
        // Clear any existing content
        adRef.current.innerHTML = ''

        // Create new ad element
        const adElement = document.createElement('ins')
        adElement.className = 'adsbygoogle'
        adElement.style.display = 'block'
        adElement.setAttribute('data-ad-client', ADSENSE_CONFIG.PUBLISHER_ID)
        adElement.setAttribute('data-ad-slot', adSlot)
        adElement.setAttribute('data-ad-format', adFormat)

        if (responsive) {
          adElement.setAttribute('data-full-width-responsive', 'true')
        }

        adRef.current.appendChild(adElement)

        // Push the ad to Google
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [adSlot, adFormat, responsive])

  return (
    <div className={`adsense-container ${className}`}>
      {adLabel && (
        <div className="text-xs text-muted-foreground text-center mb-2 font-medium">
          {adLabel}
        </div>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_CONFIG.PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

// Add TypeScript declaration for the adsbygoogle global
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}