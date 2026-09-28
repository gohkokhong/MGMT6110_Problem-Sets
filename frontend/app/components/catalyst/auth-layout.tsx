import clsx from 'clsx'

export function AuthLayout({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'main'>) {
  return (
    <main
      {...props}
      className={clsx(
        className,
        'flex min-h-dvh flex-col items-center justify-center bg-zinc-100 p-6 dark:bg-zinc-900 sm:p-12'
      )}
    >
      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}
