import { useMemo, useState } from 'react'
import { PageContainer } from '~/components/PageContainer'
import { TablePagination } from '~/components/TableControls'
import { Heading } from '~/components/catalyst/heading'
import { Text } from '~/components/catalyst/text'
import { ListFilters } from '~/components/crm/ListFilters'
import { TriageList } from '~/components/crm/TriageList'
import { UrgencySummary } from '~/components/crm/UrgencySummary'
import { VisitDetail } from '~/components/crm/VisitDetail'
import { NOW, TODAY, type Urgency, type Visit, type VisitStatus } from '~/data/crm-data'
import {
  DOCTOR_OPTIONS,
  TODAY_VISITS,
  VISITS_NEWEST_FIRST,
  formatLongDate,
  isInLastWeek,
  matchesAny,
  patientById,
} from '~/lib/crm'
import { usePagedList } from '~/lib/use-paged-list'
import type { Route } from './+types/triage'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Triage results - CRM' }]
}

type Period = 'today' | 'week' | 'all'
type Sort = 'urgent' | 'latest'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'all', label: 'All visits' },
]

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'urgent', label: 'Most urgent first' },
  { value: 'latest', label: 'Latest first' },
]

// Within one urgency level, patients still to be seen come before those already seen.
const STATUS_RANK: Record<VisitStatus, number> = { waiting: 0, 'with-doctor': 1, done: 2 }

/** Screen 1: triage results, with a count per urgency level and the results beneath. */
export default function Triage() {
  const [query, setQuery] = useState('')
  const [doctor, setDoctor] = useState('all')
  const [period, setPeriod] = useState<Period>('today')
  const [sort, setSort] = useState<Sort>('urgent')
  const [urgency, setUrgency] = useState<Urgency | null>(null)
  const [selected, setSelected] = useState<Visit | null>(null)

  // Everything except the urgency tile, so the tiles keep showing each level's count.
  const inScope = useMemo(() => {
    const source =
      period === 'today'
        ? TODAY_VISITS
        : period === 'week'
          ? VISITS_NEWEST_FIRST.filter((v) => isInLastWeek(v.date))
          : VISITS_NEWEST_FIRST
    return source.filter(
      (v) =>
        (doctor === 'all' || v.doctor === doctor) &&
        matchesAny(query, patientById.get(v.patient)!.name, v.patient, v.complaint)
    )
  }, [period, doctor, query])

  const counts = useMemo(() => {
    const c: Record<Urgency, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const v of inScope) c[v.urgency]++
    return c
  }, [inScope])

  const rows = useMemo(() => {
    const list = urgency ? inScope.filter((v) => v.urgency === urgency) : inScope
    if (sort === 'latest') return list
    return [...list].sort(
      (a, b) =>
        a.urgency - b.urgency ||
        STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
        (period === 'today' ? a.time.localeCompare(b.time) : 0)
    )
  }, [inScope, urgency, sort, period])

  const pager = usePagedList(rows)

  function changing<T>(set: (value: T) => void) {
    return (value: T) => {
      set(value)
      pager.reset()
    }
  }

  return (
    <PageContainer className="space-y-6">
      <div>
        <Heading>Triage results</Heading>
        <Text className="mt-2">
          {formatLongDate(TODAY)}, as of {NOW}. Tap a patient to open the visit.
        </Text>
      </div>

      <UrgencySummary counts={counts} selected={urgency} onSelect={changing(setUrgency)} />

      <ListFilters
        searchPlaceholder="Search patient, ID or complaint"
        onSearch={changing(setQuery)}
        selects={[
          { label: 'Doctor', value: doctor, onChange: changing(setDoctor), options: DOCTOR_OPTIONS },
          {
            label: 'Period',
            value: period,
            onChange: changing((v: string) => setPeriod(v as Period)),
            options: PERIOD_OPTIONS,
          },
          {
            label: 'Sort',
            value: sort,
            onChange: changing((v: string) => setSort(v as Sort)),
            options: SORT_OPTIONS,
          },
        ]}
      />

      <div ref={pager.topRef} className="scroll-mt-4 space-y-4">
        <TriageList rows={pager.pageRows} onSelect={setSelected} />
        <TablePagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={rows.length}
          onPageChange={pager.goTo}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={pager.changePageSize}
        />
      </div>

      <VisitDetail visit={selected} onClose={() => setSelected(null)} />
    </PageContainer>
  )
}
