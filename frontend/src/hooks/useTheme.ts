import { useEffect, useState } from 'react'

const THEMES = ['light', 'dark', 'red', 'green', 'blue'] as const
type Theme = typeof THEMES[number]

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme | null
        return saved && THEMES.includes(saved) ? saved : 'light'
    })

    useEffect(() => {
        // Очистити всі теми перед додаванням нової
        THEMES.forEach(t => document.documentElement.classList.remove(t))
        document.documentElement.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        const currentIndex = THEMES.indexOf(theme)
        const nextIndex = (currentIndex + 1) % THEMES.length
        setTheme(THEMES[nextIndex])
    }

    return { theme, setTheme, toggleTheme }
}
