import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const themeVariables: Record<Theme, Record<string, string>> = {
  dark: {
    '--background': '#0b0f17',
    '--surface-1': '#111622',
    '--surface-2': '#151b27',
    '--surface-3': '#1a2230',
    '--border': 'rgba(255, 255, 255, 0.07)',
    '--border-strong': 'rgba(255, 255, 255, 0.12)',
    '--text-primary': '#f3f4f6',
    '--text-secondary': '#9ca3af',
    '--text-muted': '#667085',
    '--accent': '#f4b942',
    '--accent-soft': 'rgba(244, 185, 66, 0.12)',
  },
  light: {
    '--background': '#f3f5f8',
    '--surface-1': '#ffffff',
    '--surface-2': '#f8fafc',
    '--surface-3': '#eef2f7',
    '--border': 'rgba(15, 23, 42, 0.10)',
    '--border-strong': 'rgba(15, 23, 42, 0.18)',
    '--text-primary': '#172033',
    '--text-secondary': '#526076',
    '--text-muted': '#7b8799',
    '--accent': '#c88712',
    '--accent-soft': 'rgba(200, 135, 18, 0.12)',
  },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('axsis-v2-theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    Object.entries(themeVariables[theme]).forEach(([name, value]) => root.style.setProperty(name, value))
    localStorage.setItem('axsis-v2-theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
