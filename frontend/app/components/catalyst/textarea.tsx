import clsx from 'clsx'

export function Textarea({
  className,
  ...props
}: { className?: string } & Omit<React.ComponentPropsWithoutRef<'textarea'>, 'className'>) {
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
      <textarea
        {...props}
        className={clsx(
          'relative block w-full appearance-none rounded-lg',
          'px-4 py-3',
          'sm:px-4 sm:py-2.5',
          'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
          'border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20',
          'bg-transparent dark:bg-white/5',
          'focus:outline-none',
          'disabled:border-zinc-950/20 disabled:bg-zinc-950/[2.5%] disabled:text-zinc-950/50',
          'dark:disabled:border-white/15 dark:disabled:bg-white/[2.5%]'
        )}
      />
    </span>
  )
}
