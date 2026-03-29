import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ButtonProps } from '../../types/componentsUI'

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    btn_glass: 'nz-glass nz-foreground',
    btn_primary: 'nz-background-primary nz-text-primary',
    btn_accent: 'nz-background-accent nz-text-accent',
    btn_secondary: 'nz-background-secondary nz-text-secondary',
    btn_destructive: 'nz-bg-destructive border-none',
    btn_muted: 'nz-background-muted nz-text-muted',
    btn_info: 'nz-bg-info border-none',
    btn_success: 'nz-bg-success border-none',
    btn_warning: 'nz-bg-warning border-none',
    btn_disabled: 'nz-bg-disabled border-none',
    //TODO: btn_warning: 'border-yellow-500 bg-yellow-300/25 backdrop-blur-xl hover:bg-yellow-400/50 hover:border-yellow-600',
    //TODO: btn_success: 'border-emerald-500 bg-emerald-300/25 backdrop-blur-xl hover:bg-emerald-400/50 hover:border-emerald-600',
    //TODO: btn_info: 'border-indigo-500 bg-indigo-300/25 backdrop-blur-xl hover:bg-indigo-400/50 hover:border-indigo-600',
    //TODO: btn_destructive: 'border-red-500 bg-red-400/25 backdrop-blur-xl hover:bg-red-600/50 hover:border-red-600',
}

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
                    'inline-flex items-center justify-center rounded-md border font-medium transition duration-200 disabled:opacity-50 disabled:pointer-events-none hover:nz-bg-hover hover:nz-text-hover',
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
