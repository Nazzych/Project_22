import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { CardProps } from '../../types/componentsUI';

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
    card_glass: 'nz-glass nz-border nz-border',
    card_primary: 'nz-background-primary nz-border',
    card_accent: 'nz-background-accent nz-border',
    card_secondary: 'nz-background-secondary nz-border',
}

const sizeStyles: Record<NonNullable<CardProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    wf: 'w-full',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'card_secondary', size = 'md', ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'nz-foreground rounded-2xl transition-all duration-300 border',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        />
    )
)
Card.displayName = 'Card'

// 📦 Заголовок картки
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('lex flex-col space-y-1.5 p-6', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

// 🏷️ Назва картки
export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

// 📝 Опис картки
export const CardDescription = forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

// 📄 Контент картки
export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

// 🦶 Футер картки
export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('bg-white/5 flex items-center p-6 pt-0', className)} {...props} />
    )
);
CardFooter.displayName = 'CardFooter';
