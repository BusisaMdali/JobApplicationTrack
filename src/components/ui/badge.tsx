import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

type BadgeProps = ComponentProps<'span'>

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn('inline-flex items-center rounded-full border border-transparent', className)}
      {...props}
    />
  )
}
