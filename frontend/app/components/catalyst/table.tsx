import clsx from 'clsx'
import { createContext, useContext, useState } from 'react'
import { Link } from './link'

/**
 * Shared table for every tabular list (CONVENTIONS.md §11) - Staff Accounts,
 * Patients, and future queues all render through these primitives so list
 * styling stays uniform. Horizontal overflow scrolls inside the wrapper; the
 * page itself never scrolls sideways. Every consumer gets three things for
 * free:
 *
 * - **Row height.** Body rows default to a 66px floor (`h-16.5`, a catalyst
 *   Button's 46px plus `py-2.5` twice) so a row's height stops depending on
 *   whether it holds a Button, an Input/Select (36px) or plain text (24px);
 *   a taller cell (wrapped text, a multi-line edit row) still grows past it.
 *   Read-only history/report tables that never carry a control opt out with
 *   `dense` and fall back to intrinsic (~44px, text-only) row height.
 * - **Stable column widths.** Give every `TableHeader` but one flex column a
 *   preferred `w-*` sized for its widest content, action buttons and edit-row
 *   controls included, so a filter or an inline edit never reflows the table.
 *   Pins are preferred, not enforced: auto table layout still compresses them
 *   under real pressure, so size against the narrowest realistic content
 *   width (944px - `PageContainer`'s `max-w-7xl` at a 1280px viewport), not
 *   the widest. A column that must never compress - one holding money, or any
 *   value that means nothing half-shown - adds `min-w-*` alongside its pin to
 *   turn it into a floor, and the flex column then yields first (give it a
 *   `min-w-*` of its own so it stays readable, and this wrapper scrolls once
 *   even that bottoms out). Note that a nowrap/truncating control reports its
 *   whole text as its column's minimum, so the flex column can only yield if
 *   its content can: see `InvoiceEditor.tsx`'s description select.
 * - **One "Loading… / no rows" row.** Use `TableMessageRow` instead of a
 *   hand-rolled `colSpan` row so every table's empty/loading state matches.
 *
 * Rows become clickable by passing `href` (navigation - a real link, so
 * cmd-click and middle-click work) or `onClick` (action rows, e.g. opening a
 * dialog), plus `title` for the overlay's aria-label. Each cell then hosts an
 * invisible overlay spanning it; only the first cell's overlay is tabbable
 * (one tab stop per row), and explicit Buttons inside cells keep working
 * because catalyst Button is `relative isolate` and paints above the overlay.
 * `editing` flags a row under inline edit with a faint tint.
 */

const TableRowContext = createContext<{
  href?: string
  onClick?: () => void
  title?: string
}>({})

export function Table({
  className,
  dense = false,
  ...props
}: { dense?: boolean } & React.ComponentPropsWithoutRef<'table'>) {
  return (
    <div className={clsx('overflow-x-auto rounded-lg ring-1 ring-zinc-950/5 dark:ring-white/10', className)}>
      <table
        {...props}
        className={clsx('min-w-full text-left text-sm/6', !dense && '[&>tbody>tr]:h-16.5')}
      />
    </div>
  )
}

export function TableHead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead
      {...props}
      className={clsx(
        // Brand dark blue header band, white type, same in both colour schemes -
        // the block itself separates head from body, so no border is needed.
        'bg-brand-strong text-white',
        className
      )}
    />
  )
}

export function TableBody({ className, ...props }: React.ComponentPropsWithoutRef<'tbody'>) {
  return (
    <tbody
      {...props}
      className={clsx('divide-y divide-zinc-950/5 text-zinc-950 dark:divide-white/5 dark:text-white', className)}
    />
  )
}

export function TableRow({
  href,
  onClick,
  title,
  editing = false,
  className,
  ...props
}: {
  href?: string
  onClick?: () => void
  title?: string
  /** Tints the row to flag it as under inline edit. */
  editing?: boolean
} & Omit<React.ComponentPropsWithoutRef<'tr'>, 'onClick' | 'title'>) {
  const interactive = Boolean(href || onClick)
  return (
    <TableRowContext.Provider value={interactive ? { href, onClick, title } : {}}>
      <tr
        {...props}
        className={clsx(
          interactive && 'cursor-pointer hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5',
          interactive &&
            'has-[[data-row-link]:focus-visible]:outline-2 has-[[data-row-link]:focus-visible]:-outline-offset-2 has-[[data-row-link]:focus-visible]:outline-brand',
          editing && 'bg-zinc-950/2.5 dark:bg-white/2.5',
          className
        )}
      />
    </TableRowContext.Provider>
  )
}

export function TableHeader({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) {
  return <th {...props} className={clsx('px-4 py-2.5 font-bold', className)} />
}

export function TableCell({ className, children, ...props }: React.ComponentPropsWithoutRef<'td'>) {
  const { href, onClick, title } = useContext(TableRowContext)
  const interactive = Boolean(href || onClick)
  const [cellRef, setCellRef] = useState<HTMLTableCellElement | null>(null)

  // One tab stop per row: only the row's first cell gets a tabbable overlay.
  const tabIndex = cellRef?.previousElementSibling === null ? 0 : -1

  return (
    <td
      ref={interactive ? setCellRef : undefined}
      {...props}
      className={clsx('px-4 py-2.5', interactive && 'relative', className)}
    >
      {href && (
        <Link
          data-row-link
          href={href}
          aria-label={title}
          tabIndex={tabIndex}
          className="absolute inset-0 focus:outline-none"
        />
      )}
      {!href && onClick && (
        <button
          type="button"
          data-row-link
          aria-label={title}
          tabIndex={tabIndex}
          onClick={onClick}
          className="absolute inset-0 cursor-pointer focus:outline-none"
        />
      )}
      {children}
    </td>
  )
}

/** The one "Loading…" / "No rows" row every table uses, spanning all its columns. */
export function TableMessageRow({
  colSpan,
  className,
  children,
}: {
  colSpan: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={clsx('py-6 text-center text-zinc-500 dark:text-zinc-400', className)}>
        {children}
      </TableCell>
    </TableRow>
  )
}
