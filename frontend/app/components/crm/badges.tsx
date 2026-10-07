import clsx from 'clsx'
import {
  ATTACHMENT_KINDS,
  URGENCY_LEVELS,
  VISIT_STATUSES,
  type AttachmentKind,
  type Urgency,
  type VisitStatus,
} from '~/data/crm-data'

// Badges are inline spans (CONVENTIONS §12). Slightly larger below `sm` than the
// kit's text-xs/5 so they stay readable at arm's length on a phone. Urgency never
// relies on colour alone: every badge also says "P1 Critical" in words.
const PILL = 'inline-flex items-center rounded-md px-2 py-0.5 text-sm/6 font-medium whitespace-nowrap sm:px-1.5 sm:text-xs/5'

const URGENCY_STYLE: Record<Urgency, string> = {
  1: 'bg-red-600 text-white',
  2: 'bg-orange-300 text-orange-950',
  3: 'bg-yellow-200 text-yellow-900',
  4: 'bg-[#C6EFCE] text-[#006100]',
}

/** Left-edge bar on phone cards, written out so Tailwind sees the class names. */
export const URGENCY_BAR: Record<Urgency, string> = {
  1: 'bg-red-600',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-green-500',
}

const STATUS_STYLE: Record<VisitStatus, string> = {
  waiting: 'bg-amber-100 text-amber-800',
  'with-doctor': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  done: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

export function UrgencyBadge({ level }: { level: Urgency }) {
  const info = URGENCY_LEVELS.find((u) => u.level === level)
  return (
    <span className={clsx(PILL, URGENCY_STYLE[level])}>
      {info?.code} {info?.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: VisitStatus }) {
  return <span className={clsx(PILL, STATUS_STYLE[status])}>{VISIT_STATUSES.find((s) => s.value === status)?.label}</span>
}

export function KindBadge({ kind }: { kind: AttachmentKind }) {
  return (
    <span className={clsx(PILL, 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300')}>
      {ATTACHMENT_KINDS.find((k) => k.value === kind)?.label}
    </span>
  )
}
