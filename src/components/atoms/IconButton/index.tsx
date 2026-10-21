import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@components/shadcn/utils'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  pressed?: boolean
}

export default function IconButton({
  label,
  children,
  pressed,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        'stitched bg-paper text-ink inline-flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
