/**
 * Simple Select wrapper with consistent styling
 * For MVP, using native <select> with custom trigger styling
 */
import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const SelectContext = createContext<SelectContextValue>({})

export function Select({
  value,
  onValueChange,
  disabled,
  children,
}: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      {children}
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  const { value, onValueChange, disabled } = useContext(SelectContext)

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      className={cn(
        'flex w-full appearance-none items-center justify-between rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </select>
  )
}

export function SelectValue(_props: { placeholder?: string }) {
  return null // Not used in native select
}

export function SelectContent({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function SelectItem({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) {
  return <option value={value}>{children}</option>
}
