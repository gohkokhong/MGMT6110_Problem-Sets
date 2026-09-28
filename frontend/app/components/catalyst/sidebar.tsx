import clsx from 'clsx'
import { Link } from './link'

export function Sidebar({ className, ...props }: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props} className={clsx(className, 'flex h-full min-h-0 flex-col')} />
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5',
        '[&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-1 flex-col overflow-y-auto p-4',
        '[&>[data-slot=section]+[data-slot=section]]:mt-8'
      )}
    />
  )
}

export function SidebarFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5',
        '[&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarSection({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      data-slot="section"
      className={clsx(className, 'flex flex-col gap-0.5')}
    />
  )
}

export function SidebarDivider({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) {
  return (
    <hr
      {...props}
      className={clsx(
        className,
        'my-4 border-t border-zinc-950/5 lg:-mx-4 dark:border-white/5'
      )}
    />
  )
}

export function SidebarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div aria-hidden="true" {...props} className={clsx(className, 'mt-8 flex-1')} />
  )
}

export function SidebarHeading({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      {...props}
      className={clsx(
        className,
        'mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400'
      )}
    />
  )
}

export function SidebarItem({
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
    'group relative flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium sm:py-2 sm:text-sm/5',
    '[&>[data-slot=icon]]:size-6 [&>[data-slot=icon]]:shrink-0 sm:[&>[data-slot=icon]]:size-5',
    current
      ? 'bg-brand/10 text-brand [&>[data-slot=icon]]:fill-brand'
      : 'text-zinc-950 hover:bg-zinc-950/5 [&>[data-slot=icon]]:fill-zinc-500 hover:[&>[data-slot=icon]]:fill-zinc-950 dark:text-white dark:hover:bg-white/5 dark:[&>[data-slot=icon]]:fill-zinc-400 dark:hover:[&>[data-slot=icon]]:fill-white',
  )

  if ('href' in props && props.href !== undefined) {
    return (
      <Link {...(props as any)} className={classes} data-current={current ? 'true' : undefined}>
        {children}
      </Link>
    )
  }

  return (
    <button
      {...(props as any)}
      className={clsx(classes, 'cursor-pointer')}
      data-current={current ? 'true' : undefined}
    >
      {children}
    </button>
  )
}

export function SidebarLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'truncate')} />
}
