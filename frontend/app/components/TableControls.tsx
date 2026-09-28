import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ArrowsUpDownIcon, CheckIcon, FunnelIcon, InformationCircleIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Button } from './catalyst/button'
import { Checkbox } from './catalyst/checkbox'
import { Input } from './catalyst/input'
import { Select } from './catalyst/select'

/**
 * Search box for list tables (CONVENTIONS.md §11): matching is partial and
 * case-insensitive, done server-side. Fires on Enter immediately, or 0.5
 * seconds after the last keystroke; clearing the box resets the list the
 * same way.
 * The term always travels in a POST body - PII never rides a query string.
 */
export function TableSearchInput({
  onSearch,
  placeholder,
  className,
  initialValue,
}: {
  onSearch: (term: string) => void
  placeholder?: string
  className?: string
  /**
   * Seeds the box with a remembered term (e.g. one useTableState restored on
   * return to the list). Read once on mount - the box stays uncontrolled
   * because the debounce means the parent's term lags the typed text.
   */
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue ?? '')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Suppress re-firing an identical term (e.g. Enter right after the debounce,
  // or Enter on a term that was restored rather than typed).
  const lastFired = useRef(initialValue?.trim() ?? '')

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  function fire(term: string) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const trimmed = term.trim()
    if (trimmed === lastFired.current) return
    lastFired.current = trimmed
    onSearch(trimmed)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => fire(next), 500)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      fire(value)
    }
  }

  return (
    <Input
      type="search"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      aria-label={placeholder ?? 'Search'}
      className={className}
    />
  )
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  // Optional rows-per-page control. Pass both to show the selector (e.g.
  // Patients); omit both and the bar renders pagination alone (e.g. Staff
  // Accounts), so existing callers are unaffected.
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm/6 text-zinc-500 dark:text-zinc-400">
          {total === 0 ? 'No results' : `Showing ${from}-${to} of ${total}`}
        </p>
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm/6 text-zinc-500 dark:text-zinc-400">Rows</span>
            <Select
              aria-label="Rows"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-28"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button plain disabled={page <= 1} onClick={() => onPageChange(1)}>
          First
        </Button>
        <Button plain disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-sm/6 tabular-nums text-zinc-500 dark:text-zinc-400">
          Page {page} of {lastPage}
        </span>
        <Button plain disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

/**
 * Small checkbox-overlay filter for a table column header (e.g. Sex,
 * Status). `selected` lists the currently-ticked options; an empty selection
 * is a valid, deliberate "match nothing" state - callers decide how the
 * empty result set is presented, this component just reflects what's ticked.
 */
export function ColumnFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (next: T[]) => void
}) {
  const isFiltered = selected.length !== options.length

  function toggle(value: T) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <Popover as="span" className="inline-flex">
      <PopoverButton
        aria-label={`Filter ${label}`}
        className={clsx(
          // Lives inside the brand-blue table header, so the icon is toned
          // against white rather than against the page background.
          'cursor-pointer rounded-sm p-0.5 focus:outline-none',
          'data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-white',
          isFiltered ? 'text-white' : 'text-white/60 hover:text-white'
        )}
      >
        <FunnelIcon className="size-3.5" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom start"
        transition
        className={clsx(
          'z-20 mt-1 w-36 rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 focus:outline-none',
          'dark:bg-zinc-800 dark:ring-white/10',
          'origin-top transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0'
        )}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm/6 font-normal text-zinc-700 hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <Checkbox checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} />
            {opt.label}
          </label>
        ))}
      </PopoverPanel>
    </Popover>
  )
}

/**
 * Single-select ordering menu for a table column header (e.g. Name: A to Z /
 * Z to A / Latest first). Unlike ColumnFilter, exactly one mode is always
 * active - there is no "clear". `defaultValue` is the mode considered
 * "unsorted", which only dims the icon; it does not change behavior.
 */
export function ColumnSort<T extends string>({
  label,
  options,
  value,
  defaultValue,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  defaultValue: T
  onChange: (next: T) => void
}) {
  const isSorted = value !== defaultValue
  const activeLabel = options.find((opt) => opt.value === value)?.label ?? ''

  return (
    <Popover as="span" className="inline-flex">
      <PopoverButton
        aria-label={`Sort ${label}: ${activeLabel}`}
        className={clsx(
          'cursor-pointer rounded-sm p-0.5 focus:outline-none',
          'data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-white',
          isSorted ? 'text-white' : 'text-white/60 hover:text-white'
        )}
      >
        <ArrowsUpDownIcon className="size-3.5" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom start"
        transition
        className={clsx(
          'z-20 mt-1 w-40 rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 focus:outline-none',
          'dark:bg-zinc-800 dark:ring-white/10',
          'origin-top transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0'
        )}
      >
        {({ close }) => (
          <>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={opt.value === value}
                onClick={() => {
                  onChange(opt.value)
                  close()
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm/6 font-normal text-zinc-700 hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                {opt.value === value ? (
                  <CheckIcon className="size-3.5 shrink-0" />
                ) : (
                  <span aria-hidden="true" className="size-3.5 shrink-0" />
                )}
                {opt.label}
              </button>
            ))}
          </>
        )}
      </PopoverPanel>
    </Popover>
  )
}

/**
 * Hover hint for a table column header - explains data semantics (e.g.
 * snapshot-vs-live) that aren't obvious from the column alone. CSS
 * `group-hover`, not the native `title` attribute, so the text appears the
 * instant the pointer enters instead of after the browser's built-in delay.
 */
export function ColumnHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <InformationCircleIcon aria-hidden="true" className="size-3.5 shrink-0 text-white/60 group-hover:text-white" />
      <span className="sr-only">{text}</span>
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute top-full left-1/2 z-30 mt-1 hidden w-max max-w-56 -translate-x-1/2 rounded-md',
          'bg-zinc-900 px-2 py-1 text-xs font-normal normal-case text-white shadow-lg group-hover:block',
          'dark:bg-zinc-700'
        )}
      >
        {text}
      </span>
    </span>
  )
}
