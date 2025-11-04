/**
 * AdSense component types and interfaces
 */

export interface GoogleAdSenseProps {
  adSlot: string
  adFormat?: string
  className?: string
  style?: React.CSSProperties
  responsive?: boolean
  adLabel?: string
}

export interface InFeedAdProps {
  className?: string
  adLabel?: string
}

export interface SidebarAdProps {
  className?: string
  adLabel?: string
  sticky?: boolean
}

export interface AdSlotConfig {
  slot: string
  format: string
  size?: {
    width: number
    height: number
  }
  responsive?: boolean
}

export type AdPlacement = 'infeed' | 'sidebar' | 'sidebar-compact' | 'horizontal'

export interface AdConfig {
  placement: AdPlacement
  slotId: string
  format: string
  dimensions?: {
    width: number
    height: number
  }
  responsive?: boolean
  className?: string
}

// AdSense publisher information
export const ADSENSE_CONFIG = {
  PUBLISHER_ID: 'ca-pub-6901484702416637',
  AD_SLOTS: {
    INFEED_1: '1234567890',
    INFEED_2: '0987654321',
    SIDEBAR_VERTICAL: '5432109876',
    SIDEBAR_COMPACT: '1357924680',
    HORIZONTAL_BANNER: '2468135790',
  } as const,
  PLACEMENTS: {
    EVERY_3_JOKES: 3,
    SIDEBAR_TOP: 'top',
    SIDEBAR_BOTTOM: 'bottom',
    AFTER_JOKE_CONTENT: 'after-joke',
  } as const,
}

// Default ad configurations
export const DEFAULT_AD_CONFIGS: Record<AdPlacement, AdConfig> = {
  'infeed': {
    placement: 'infeed',
    slotId: ADSENSE_CONFIG.AD_SLOTS.INFEED_1,
    format: 'fluid',
    dimensions: { width: 300, height: 250 },
    responsive: true,
  },
  'sidebar': {
    placement: 'sidebar',
    slotId: ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_VERTICAL,
    format: 'vertical',
    dimensions: { width: 300, height: 600 },
    responsive: false,
  },
  'sidebar-compact': {
    placement: 'sidebar-compact',
    slotId: ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_COMPACT,
    format: 'rectangle',
    dimensions: { width: 300, height: 250 },
    responsive: false,
  },
  'horizontal': {
    placement: 'horizontal',
    slotId: ADSENSE_CONFIG.AD_SLOTS.HORIZONTAL_BANNER,
    format: 'horizontal',
    dimensions: { width: 728, height: 90 },
    responsive: true,
  },
}