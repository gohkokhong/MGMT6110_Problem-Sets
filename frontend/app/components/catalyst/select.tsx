import { ChevronDownIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'

export function Select({
  className,
  children,
  invalid,
  ...props
}: { className?: string; invalid?: boolean } & Omit<React.ComponentPropsWithoutRef<'select'>, 'className'>) {
  return (
    <span
      data-slot="control"
      className={clsx(
        className,
        'relative block w-full',
        'before:absolute before:inset-px before:rounded-[calc(theme(--radius-lg)-1px)] before:bg-white before:shadow',
        'dark:before:hidden',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent',
        'focus-within:after:ring-2 focus-within:after:ring-brand'
      )}
    >
      <select
        aria-invalid={invalid || undefined}
        {...props}
        className={clsx(
          'relative block w-full appearance-none rounded-lg',
          'px-4 py-3',
          'sm:px-4 sm:py-2.5',
          'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white',
          // The native option list inherits the select's colours, so give it its own
          // opaque pair - otherwise dark mode renders white text on a white popup.
          '*:text-zinc-950 dark:*:bg-zinc-800 dark:*:text-white',
          'border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20',
          // The hover form is spelled out so the red wins whatever order Tailwind
          // emits the variants in; the base border loses on specificity alone.
          'aria-[invalid=true]:border-red-500 aria-[invalid=true]:hover:border-red-500',
          'dark:aria-[invalid=true]:border-red-500 dark:aria-[invalid=true]:hover:border-red-500',
          'bg-transparent dark:bg-white/5',
          'cursor-pointer focus:outline-none',
          'pr-10',
          'disabled:cursor-default disabled:border-zinc-950/20 disabled:bg-zinc-950/2.5 disabled:text-zinc-950/50',
          'dark:disabled:border-white/15 dark:disabled:bg-white/2.5 dark:disabled:text-white/50'
        )}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDownIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
      </span>
    </span>
  )
}
