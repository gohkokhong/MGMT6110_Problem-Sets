import clsx from 'clsx'
import { Link } from './link'

export function Navbar({ className, ...props }: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props} className={clsx(className, 'flex flex-1 items-center gap-4 py-2.5')} />
  )
}

export function NavbarDivider({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={clsx(className, 'h-6 w-px bg-zinc-950/10 dark:bg-white/10')}
    />
  )
}

export function NavbarSection({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(className, 'flex items-center gap-3')} />
}

export function NavbarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div {...props} aria-hidden="true" className={clsx(className, '-ml-4 flex-1')} />
  )
}

export function NavbarLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'truncate')} />
}

export function NavbarItem({
  current,
  children,
  ...props
}: {
  current?: boolean
} & (
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  | (Omit<React.ComponentPropsWithoutRef<'button'>, 'className'> & { href?: undefined })
)) {
  const classes = clsx(
    'relative flex min-w-0 items-center gap-3 rounded-lg p-2 text-left text-base/6 font-medium text-zinc-950 sm:text-sm/5',
    'hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5',
    current && 'bg-zinc-950/5 dark:bg-white/5'
  )

  if ('href' in props && props.href !== undefined) {
    return (
      <Link {...(props as any)} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button {...(props as any)} className={classes}>
      {children}
    </button>
  )
}
