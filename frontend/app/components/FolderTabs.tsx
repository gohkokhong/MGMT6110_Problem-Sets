import clsx from 'clsx'
import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'

/**
 * Folder tabs - a row of rounded tabs over a bordered panel - shared by the
 * check-in page's stage tabs (`queue/StageTabs.tsx`, headlessui tabs switched
 * in place) and the Configurations hub (`FolderNavTabs` below, one route per
 * tab), so the two read the same and the look lives in one place. The patient
 * file keeps its own underline bar (`patient-file/PatientTabs.tsx`).
 */

/**
 * One tab. The selected one is the panel's own surface (white, zinc-900 in
 * dark) and its bottom edge takes that colour, so it knocks out the bar's line
 * and opens into the panel below. The rest sit behind it in the brand blue
 * tint. Solid border colours throughout: a translucent line would show through
 * where a tab overlaps it.
 */
export function folderTabClass(active: boolean): string {
  return clsx(
    'relative -mb-px flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border px-4 text-sm/6 font-medium whitespace-nowrap',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
    active
      ? 'z-10 border-zinc-200 border-b-white bg-white text-zinc-950 dark:border-zinc-700 dark:border-b-zinc-900 dark:bg-zinc-900 dark:text-white'
      : 'border-blue-200 border-b-zinc-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-900 dark:border-b-zinc-700 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900 dark:hover:text-white'
  )
}

/**
 * The inactive tab's hover tint again, as a `group-hover` variant, for a tab
 * that carries a control of its own (a close button): the pointer then sits on
 * that control rather than on the tab, so the tab's own `hover:` stops matching
 * and the tint would drop out from under the pointer. Written out because
 * Tailwind reads class names literally - keep it in step with the `hover:`
 * colours above, which are the ones it repeats.
 */
export const FOLDER_TAB_GROUP_HOVER_CLASS =
  'group-hover:bg-blue-100 group-hover:text-blue-900 dark:group-hover:bg-blue-900 dark:group-hover:text-white'

/**
 * The bar the tabs stand on, whose line is the panel's top edge. Full width at
 * least and wider when the tabs need it, so it goes inside an `overflow-x-auto`
 * scroller.
 */
export const FOLDER_TAB_BAR_CLASS = 'flex w-max min-w-full gap-1 border-b border-zinc-200 dark:border-zinc-700'

/** The panel the selected tab opens into. */
export const FOLDER_TAB_PANEL_CLASS =
  'rounded-b-xl border-x border-b border-zinc-200 bg-white px-4 py-8 sm:px-6 dark:border-zinc-700 dark:bg-zinc-900'

/**
 * Scrolls a sideways-scrolling bar just far enough to show `tab`, and nothing
 * else - unlike `scrollIntoView`, which may scroll the page too (undoing the
 * position ScrollRestoration puts back on Back/Forward) and, in Chromium, also
 * moves the Tab key's starting point, so the first Tab press after it skipped
 * the selected tab and landed in its panel.
 */
export function revealTab(scroller: HTMLElement | null, tab: HTMLElement | null | undefined): void {
  if (!scroller || !tab) return
  const bar = scroller.getBoundingClientRect()
  const box = tab.getBoundingClientRect()
  if (box.left < bar.left) scroller.scrollLeft -= bar.left - box.left
  else if (box.right > bar.right) scroller.scrollLeft += box.right - bar.right
}

/**
 * Folder tabs whose tabs are routes: each one is a NavLink, so the address bar,
 * Back and a middle-click all keep working, and the panel holds whatever the
 * matched child route renders (the layout's `<Outlet />`). On a narrow screen
 * the bar scrolls sideways and keeps the current tab in view, as StageTabs'
 * does.
 */
export function FolderNavTabs({
  label,
  tabs,
  children,
}: {
  /** Names the bar for assistive tech. */
  label: string
  /** `end`: active on an exact match only, so an index route's tab does not also light up under its siblings. */
  tabs: { label: string; to: string; end: boolean }[]
  children: ReactNode
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    revealTab(scrollerRef.current, scrollerRef.current?.querySelector<HTMLElement>('[aria-current="page"]'))
  }, [pathname])

  return (
    <div>
      <div ref={scrollerRef} className="overflow-x-auto">
        <nav aria-label={label} className={FOLDER_TAB_BAR_CLASS}>
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => folderTabClass(isActive)}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className={FOLDER_TAB_PANEL_CLASS}>{children}</div>
    </div>
  )
}
