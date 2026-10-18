import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

type InputProps = ComponentProps<'input'>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      className={cn(
        'rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50',
        className,
      )}
      {...props}
    />
  )
}
