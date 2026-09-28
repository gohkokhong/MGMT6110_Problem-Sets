import clsx from 'clsx'

/**
 * Shared max-width for every module page in the right column (SidebarLayout's
 * <main>), so the whole app is capped at the same width from one place.
 * Changing the width here changes it everywhere.
 */
export function PageContainer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx('max-w-7xl', className)} />
}
