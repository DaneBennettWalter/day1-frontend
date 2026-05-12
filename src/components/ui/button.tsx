/**
 * Button component
 */
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:pointer-events-none',
          {
            'bg-primary text-primary-foreground hover:opacity-90':
              variant === 'default',
            'border bg-background hover:bg-accent hover:text-accent-foreground':
              variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
