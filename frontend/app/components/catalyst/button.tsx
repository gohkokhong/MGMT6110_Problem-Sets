import { Button as HeadlessButton } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'
import { Link } from './link'

const baseStyles = [
  // Layout
  'relative isolate inline-flex items-center justify-center',
  'gap-x-2 rounded-lg border',

  // Typography
  'text-base/6 font-semibold',
  'sm:text-sm/6',

  // Padding
  'px-4 py-3',
  'sm:px-4 sm:py-2.5',

  // Interaction
  'cursor-pointer',
  'focus:outline-none',
  'data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-brand',
  'data-[disabled]:opacity-50',

  // Icon slot
  '[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0',
  'sm:[&>[data-slot=icon]]:my-1 sm:[&>[data-slot=icon]]:size-4',
]

const solidStyles = [
  // Colours
  'border-transparent bg-(--btn-bg) text-(--btn-color)',
  '[--btn-hover-overlay:theme(--color-white/10%)]',

  // Layered shadow via before/after pseudo-elements
  'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(--radius-lg)-1px)] before:bg-(--btn-bg)',
  'before:shadow-md before:shadow-black/5',
  'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(--radius-lg)-1px)] after:shadow',

  // Hover / active overlay
  'data-[active]:after:bg-(--btn-hover-overlay) data-[hover]:after:bg-(--btn-hover-overlay)',

  // Disabled
  'data-[disabled]:before:shadow-none data-[disabled]:after:shadow-none',
]

const colorStyles: Record<string, string[]> = {
  zinc: [
    '[--btn-bg:theme(--color-zinc-900)] [--btn-color:white]',
    'dark:[--btn-bg:theme(--color-zinc-600)]',
  ],
  white: [
    '[--btn-bg:white] [--btn-color:theme(--color-brand-strong)]',
    '[--btn-hover-overlay:theme(--color-blue-50)] dark:[--btn-hover-overlay:theme(--color-white/10%)]',
    'dark:[--btn-bg:theme(--color-zinc-200/15%)]',
    'border-zinc-950/10 dark:border-white/15',
  ],
  brand: [
    '[--btn-bg:theme(--color-brand)] [--btn-color:white]',
    '[--btn-hover-overlay:theme(--color-blue-700)]',
  ],
  'brand-strong': [
    '[--btn-bg:theme(--color-brand-strong)] [--btn-color:white]',
    '[--btn-hover-overlay:theme(--color-brand-strong-hover)]',
  ],
  danger: [
    '[--btn-bg:theme(--color-red-600)] [--btn-color:white]',
    '[--btn-hover-overlay:theme(--color-red-700)]',
  ],
}

const outlineStyles = [
  'border-zinc-950/10 text-zinc-950',
  'data-[active]:bg-zinc-950/[2.5%] data-[hover]:bg-zinc-950/[2.5%]',
  'dark:border-white/15 dark:text-white',
  'dark:data-[active]:bg-white/5 dark:data-[hover]:bg-white/5',
]

const plainStyles = [
  'border-transparent text-zinc-950',
  'data-[active]:bg-zinc-950/5 data-[hover]:bg-zinc-950/5',
  'dark:text-white',
  'dark:data-[active]:bg-white/10 dark:data-[hover]:bg-white/10',
]

/**
 * `color="danger"` also repaints `outline` and `plain`, which is why these two
 * exist as whole replacement arrays rather than extra classes: both hard-code
 * `text-zinc-950`, and a `text-red-600` passed through `className` silently
 * loses to it (Tailwind v4 emits colour utilities alphabetically, so zinc wins
 * whatever order the class attribute lists them in) - the same trap `Text`'s
 * `tone` exists for. Call sites used to reach for `text-red-600!` instead.
 */
const dangerOutlineStyles = [
  'border-red-600/30 text-red-600',
  'data-[active]:bg-red-600/5 data-[hover]:bg-red-600/5',
  'dark:border-red-400/30 dark:text-red-400',
  'dark:data-[active]:bg-red-400/10 dark:data-[hover]:bg-red-400/10',
]

const dangerPlainStyles = [
  'border-transparent text-red-600',
  'data-[active]:bg-red-600/10 data-[hover]:bg-red-600/10',
  'dark:text-red-400',
  'dark:data-[active]:bg-red-400/10 dark:data-[hover]:bg-red-400/10',
]

/** `danger` is the one destructive treatment - void, cancel, delete, revoke (CONVENTIONS.md §12). */
type ButtonColor = 'zinc' | 'white' | 'brand' | 'brand-strong' | 'danger'

type ButtonProps = {
  color?: ButtonColor
  outline?: boolean
  plain?: boolean
  className?: string
  children?: React.ReactNode
} & (
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  | (Omit<React.ComponentPropsWithoutRef<'button'>, 'className'> & { href?: undefined })
)

export const Button = React.forwardRef(function Button(
  { color = 'zinc', outline, plain, className, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
  const classes = clsx(
    className,
    baseStyles,
    outline
      ? color === 'danger'
        ? dangerOutlineStyles
        : outlineStyles
      : plain
        ? color === 'danger'
          ? dangerPlainStyles
          : plainStyles
        : [...solidStyles, ...(colorStyles[color] ?? colorStyles.zinc)]
  )

  if ('href' in props && props.href !== undefined) {
    return (
      <Link
        {...(props as React.ComponentPropsWithoutRef<typeof Link>)}
        className={classes}
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
      >
        {children}
      </Link>
    )
  }

  return (
    <HeadlessButton
      {...(props as React.ComponentPropsWithoutRef<typeof HeadlessButton>)}
      className={classes}
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
    >
      {children}
    </HeadlessButton>
  )
})
