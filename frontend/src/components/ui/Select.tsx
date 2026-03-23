import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/cn'
import { ChevronDown } from 'lucide-react'
import { SelectProps, SelectOption } from '../../types/componentsUI'

export function Select({
    options,
    placeholder = 'Choose ...',
    className,
    defaultLabel,
    dropdownWidth = '100%',
    value,
    onChange,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState<SelectOption | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const opt = options.find(o => o.value === value);
        if (opt) setSelected(opt);
        else setSelected(null);
    }, [value, options]);

    const handleSelect = (option: SelectOption) => {
        setSelected(option)
        setIsOpen(false)
        onChange?.(String(option.value))
    }

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button type='button'
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-left transition duration-300 focus:outline-none focus:nz-ring"
            >
                <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                    {selected?.label || defaultLabel || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 text-primary" />
            </button>

            {isOpen && (
                <ul
                    className={cn(
                        'absolute z-50 mt-1 rounded-xl shadow-md border max-h-60 overflow-auto transition-all',
                        'nz-background-secondary ',
                    )}
                    style={{ width: dropdownWidth }}
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className="px-3 py-2 text-sm cursor-pointer hover:nz-bg-hover hover:nz-text-hover"
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
