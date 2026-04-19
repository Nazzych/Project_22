import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ButtonProps } from '../../types/componentsUI'

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    btn_glass: 'nz-glass nz-foreground hover:nz-bg-hover hover:nz-text-hover',
    btn_primary: 'nz-background-primary nz-text-primary hover:nz-bg-hover hover:nz-text-hover',
    btn_accent: 'nz-background-accent nz-text-accent hover:nz-bg-hover hover:nz-text-hover',
    btn_secondary: 'nz-background-secondary nz-text-secondary hover:nz-bg-hover hover:nz-text-hover',
    btn_muted: 'nz-background-muted nz-text-muted hover:nz-bg-hover hover:nz-text-hover',
    btn_disabled: 'nz-bg-disabled border-none',
    btn_success: 'border border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 backdrop-blur-xl transition-all',
    btn_warning: 'border border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 backdrop-blur-xl transition-all',
    btn_info: 'border border-sky-500 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 backdrop-blur-xl transition-all',
    btn_destructive: 'border border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 backdrop-blur-xl transition-all',}
    // btn_destructive: 'nz-bg-destructive border-none hover:nz-bg-hover hover:nz-text-hover',
    // btn_info: 'nz-bg-info border-none',
    // btn_success: 'nz-bg-success border-none',
    // btn_warning: 'nz-bg-warning border-none',

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    wf: 'w-full h-10 text-sm',
    icon: 'h-10 w-10',
}
{/* hover:nz-bg-hover hover:nz-text-hover */}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'btn_primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md border font-medium transition duration-200 disabled:opacity-50 disabled:pointer-events-none',
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                disabled={disabled || isLoading}
                aria-busy={isLoading}
                type='button'
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
