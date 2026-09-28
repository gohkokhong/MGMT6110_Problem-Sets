import clsx from 'clsx'
import { Link } from './link'

/**
 * The colours secondary prose comes in. `tone` is the one supported way to
 * colour a `Text`: a colour class passed through `className` silently loses
 * to the component's own zinc, because Tailwind v4 emits colour utilities in
 * alphabetical order and zinc sorts after amber, red and even `white`, so the
 * later rule wins whatever order the class attribute lists them in. Layout,
 * weight and numeric classes (`mt-4`, `font-medium`, `tabular-nums`,
 * `truncate`) set different properties and pass through `className` fine.
 */
const TEXT_TONES = {
  /** Muted zinc - the default for secondary prose. */
  default: 'text-zinc-500 dark:text-zinc-400',
  /** Lighter still: metadata and fine print (a "last updated" stamp, a terms line). */
  subtle: 'text-zinc-400 dark:text-zinc-500',
  /** Amber notice - something to know before acting, never a block (CONVENTIONS.md §12). */
  warning: 'text-amber-600 dark:text-amber-400',
  /** Red prose - a failed or voided state, or money owed. A rule a *field* breaks is `ErrorMessage`, which also marks the field. */
  danger: 'text-red-600 dark:text-red-400',
} as const

export type TextTone = keyof typeof TEXT_TONES

export function Text({
  className,
  tone = 'default',
  ...props
}: { tone?: TextTone } & React.ComponentPropsWithoutRef<'p'>) {
  return <p {...props} className={clsx(className, 'text-base/6 sm:text-sm/6', TEXT_TONES[tone])} />
}

export function TextLink({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        'text-zinc-950 underline decoration-zinc-950/50 data-[hover]:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-[hover]:decoration-white'
      )}
    />
  )
}

/** Emphasis inside a `Text`: the label weight and colour, so a lead-in or a figure stands out of muted prose. */
export function Strong({ className, ...props }: React.ComponentPropsWithoutRef<'strong'>) {
  return (
    <strong
      {...props}
      className={clsx(className, 'font-medium text-zinc-950 dark:text-white')}
    />
  )
}
