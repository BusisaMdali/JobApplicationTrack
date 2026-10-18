import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

type CardProps = ComponentProps<'section'>

export function Card({ className, ...props }: CardProps) {
  return (
    <section
      data-slot="card"
      className={cn('rounded-xl border bg-white shadow-sm dark:bg-slate-900', className)}
      {...props}
    />
  )
}
