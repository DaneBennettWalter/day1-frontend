/**
 * Label component
 */
import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('mb-1.5 block text-sm font-medium', className)}
        {...props}
      />
    )
  }
)

Label.displayName = 'Label'
