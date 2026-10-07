import clsx from 'clsx'
import { URGENCY_LEVELS, type Urgency } from '~/data/crm-data'
import { UrgencyBadge } from './badges'

/**
 * Four tiles, one per urgency level, each with its patient count. Tapping a tile
 * narrows the list below to that level; tapping it again shows every level.
 */
export function UrgencySummary({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<Urgency, number>
  selected: Urgency | null
  onSelect: (level: Urgency | null) => void
}) {
  return (
    <ul aria-label="Patients by urgency" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {URGENCY_LEVELS.map(({ level, target }) => {
        const active = selected === level
        return (
          <li key={level}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : level)}
              className={clsx(
                'flex h-full w-full cursor-pointer flex-col items-start gap-1 rounded-xl border p-4 text-left',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                active
                  ? 'border-brand bg-brand/5 ring-1 ring-brand'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
              )}
            >
              <UrgencyBadge level={level} />
              <span className="text-2xl/8 font-semibold text-zinc-950 tabular-nums dark:text-white">{counts[level]}</span>
              <span className="text-sm/6 text-zinc-500 dark:text-zinc-400">{target}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
