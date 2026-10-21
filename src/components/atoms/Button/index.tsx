import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

import { cn } from '@components/shadcn/utils'

type Variant = 'primary' | 'ghost'
type Common = { variant?: Variant; className?: string; children: ReactNode }
export type ButtonProps = Common &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  )

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-display text-[15px] font-bold transition-transform active:scale-95'
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent shadow-md hover:brightness-105',
  ghost: 'bg-paper-2 text-ink hover:bg-paper',
}

export default function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], className)
  if ('href' in rest && rest.href) {
    const { href, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string
    }
    return (
      <a href={href} className={classes} {...a}>
        {children}
      </a>
    )
  }
  return (
    <button
      type="button"
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
