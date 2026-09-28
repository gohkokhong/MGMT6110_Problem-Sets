import { forwardRef } from 'react'
import clsx from 'clsx'

export function CheckboxGroup({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} data-slot="control" className={clsx(className, 'flex flex-wrap gap-6')} />
}

export function CheckboxField({ className, ...props }: React.ComponentPropsWithoutRef<'label'>) {
  return (
    <label
      {...props}
      className={clsx(className, 'flex cursor-pointer items-center gap-2 text-sm text-zinc-950 select-none dark:text-white')}
    />
  )
}

export const Checkbox = forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        type="checkbox"
        className={clsx(
          className,
          'size-4 cursor-pointer rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-white'
        )}
      />
    )
  }
)
