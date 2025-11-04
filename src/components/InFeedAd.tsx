import React from 'react'
import { GoogleAdSense } from './GoogleAdSense'
import { InFeedAdProps, ADSENSE_CONFIG } from '@/types/adsense'

export function InFeedAd({
  className = 'my-6',
  adLabel = 'Reklama'
}: InFeedAdProps) {
  return (
    <div className={`ad-infeed ${className}`}>
      <div className="bg-muted/20 rounded-xl border border-border/50 p-4 my-4">
        <GoogleAdSense
          adSlot={ADSENSE_CONFIG.AD_SLOTS.INFEED_1}
          adFormat="fluid"
          adLabel={adLabel}
          className="w-full"
          style={{
            minHeight: '250px',
            width: '100%',
            maxWidth: '100%'
          }}
        />
      </div>
    </div>
  )
}

// Alternative ad slot for variety
export function InFeedAdAlternate({
  className = 'my-6',
  adLabel = 'Reklama'
}: InFeedAdProps) {
  return (
    <div className={`ad-infeed-alternate ${className}`}>
      <div className="bg-muted/20 rounded-xl border border-border/50 p-4 my-4">
        <GoogleAdSense
          adSlot={ADSENSE_CONFIG.AD_SLOTS.INFEED_2}
          adFormat="fluid"
          adLabel={adLabel}
          className="w-full"
          style={{
            minHeight: '250px',
            width: '100%',
            maxWidth: '100%'
          }}
        />
      </div>
    </div>
  )
}