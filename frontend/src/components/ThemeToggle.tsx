import React, { useMemo } from 'react'
import { useTheme } from '../hooks/useTheme'
// import { Palette } from 'lucide-react'
import { Select } from './ui/Select'

const themeOptions = [
    { value: 'light', label: 'Light', color: '#f5f5f5' },
    { value: 'dark', label: 'Dark', color: '#1e1e1e' },
    { value: 'red', label: 'Red', color: '#b00' },
    { value: 'green', label: 'Green', color: '#0b0' },
    { value: 'blue', label: 'Blue', color: '#38bdf8' },
]

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    // Знаходимо активну тему
    const current = themeOptions.find((opt) => opt.value === theme)

    // Формуємо список без активної теми
    const filteredOptions = useMemo(
        () =>
            themeOptions
                .filter((opt) => opt.value !== theme)
                .map(({ value, label, color }) => ({
                    value,
                    label: (
                        <span className="flex items-center gap-2">
                            <span
                                style={{
                                    backgroundColor: color,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    border: '1px solid #333',
                                }}
                            />
                            {label}
                        </span>
                    ),
                })),
        [theme]
    )

    // Відображення активної теми
    const selectedLabel = (
        <span className="flex items-center gap-2">
            <span
                style={{
                    backgroundColor: current?.color,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '1px solid #333',
                }}
            />
            {current?.label}
        </span>
    )

    return (
        <div className="flex items-center gap-1">
            {/* <Palette className="text-primary" size={18} /> */}
            <Select
                options={filteredOptions}
                placeholder="Theme"
                dropdownWidth="7.5rem"
                onChange={(value) => setTheme(value as any)}
                defaultLabel={selectedLabel}
            />
        </div>
    )
}
