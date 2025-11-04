import React from 'react'
import { GoogleAdSense } from './GoogleAdSense'
import { SidebarAdProps, ADSENSE_CONFIG } from '@/types/adsense'

export function SidebarAd({
  className = '',
  adLabel = 'Reklama',
  sticky = false
}: SidebarAdProps) {
  return (
    <div className={`ad-sidebar ${className} ${sticky ? 'sticky top-24' : ''}`}>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <GoogleAdSense
          adSlot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_VERTICAL}
          adFormat="vertical"
          adLabel={adLabel}
          className="w-full"
          style={{
            minHeight: '600px',
            width: '300px',
            maxWidth: '100%',
            margin: '0 auto'
          }}
        />
      </div>
    </div>
  )
}

// Smaller sidebar ad for mobile or tighter spaces
export function SidebarAdCompact({
  className = '',
  adLabel = 'Reklama'
}: SidebarAdProps) {
  return (
    <div className={`ad-sidebar-compact ${className}`}>
      <div className="bg-card rounded-xl shadow-sm border border-border p-3">
        <GoogleAdSense
          adSlot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_COMPACT}
          adFormat="rectangle"
          adLabel={adLabel}
          className="w-full"
          style={{
            minHeight: '250px',
            width: '300px',
            maxWidth: '100%',
            margin: '0 auto'
          }}
        />
      </div>
    </div>
  )
}