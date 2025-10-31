import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type FontSize = 'normal' | 'large' | 'extra-large'
type Theme = 'light' | 'dark'

interface Settings {
  theme: Theme
  fontSize: FontSize
  highContrast: boolean
  reducedMotion: boolean
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  toggleTheme: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  isDarkMode: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load settings from localStorage or use defaults
    const saved = localStorage.getItem('jokebox-settings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall back to defaults if JSON is invalid
      }
    }

    return {
      theme: 'light',
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false
    }
  })

  const [isDarkMode, setIsDarkMode] = useState(false)

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('jokebox-settings', JSON.stringify(settings))
  }, [settings])

  // Set dark mode based on theme
  useEffect(() => {
    setIsDarkMode(settings.theme === 'dark')
  }, [settings.theme])

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // Apply theme
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply font size
    root.classList.remove('text-normal', 'text-large', 'text-extra-large')
    root.classList.add(`text-${settings.fontSize}`)

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms')
    } else {
      root.style.setProperty('--transition-duration', '')
    }
  }, [settings, isDarkMode])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    updateSettings({ theme: newTheme })
  }

  const increaseFontSize = () => {
    const sizes: FontSize[] = ['normal', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(settings.fontSize)
    const nextSize = sizes[Math.min(currentIndex + 1, sizes.length - 1)]
    updateSettings({ fontSize: nextSize })
  }

  const decreaseFontSize = () => {
    const sizes: FontSize[] = ['normal', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(settings.fontSize)
    const prevSize = sizes[Math.max(currentIndex - 1, 0)]
    updateSettings({ fontSize: prevSize })
  }

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast })
  }

  const toggleReducedMotion = () => {
    updateSettings({ reducedMotion: !settings.reducedMotion })
  }

  const value: SettingsContextType = {
    settings,
    updateSettings,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    isDarkMode
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}