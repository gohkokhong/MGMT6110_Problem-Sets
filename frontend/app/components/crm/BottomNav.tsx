import clsx from 'clsx'
import { useLocation } from 'react-router'
import { Link } from '~/components/catalyst/link'

/**
 * The three screens as a bar along the bottom edge on a phone or tablet, within
 * thumb reach. The sidebar takes over from 1280px up, so this hides there. Each
 * item is a router link: moving between screens never reloads the page.
 */
export function BottomNav({
  items,
}: {
  items: { href: string; label: string; icon: React.ComponentType<React.ComponentPropsWithoutRef<'svg'>> }[]
}) {
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Screens"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-950/10 bg-white xl:hidden dark:border-white/10 dark:bg-zinc-900"
    >
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, icon: Icon }) => {
          const current = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={clsx(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-sm/5 font-medium',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
                  current
                    ? 'text-brand'
                    : 'text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5'
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
