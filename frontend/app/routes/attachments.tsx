import { useMemo, useState } from 'react'
import { PageContainer } from '~/components/PageContainer'
import { TablePagination } from '~/components/TableControls'
import { Heading } from '~/components/catalyst/heading'
import { Text } from '~/components/catalyst/text'
import { AttachmentList } from '~/components/crm/AttachmentList'
import { ListFilters } from '~/components/crm/ListFilters'
import { VisitDetail } from '~/components/crm/VisitDetail'
import { ATTACHMENT_KINDS, type Visit } from '~/data/crm-data'
import {
  ATTACHMENTS_NEWEST_FIRST,
  DOCTOR_OPTIONS,
  matchesAny,
  patientById,
  visitById,
} from '~/lib/crm'
import { usePagedList } from '~/lib/use-paged-list'
import type { Route } from './+types/attachments'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Patient attachments - CRM' }]
}

const KIND_OPTIONS = [{ value: 'all', label: 'All types' }, ...ATTACHMENT_KINDS]

/** Screen 3: files attached to patient records, newest visit first. */
export default function Attachments() {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [doctor, setDoctor] = useState('all')
  const [selected, setSelected] = useState<Visit | null>(null)

  const rows = useMemo(
    () =>
      ATTACHMENTS_NEWEST_FIRST.filter((a) => {
        const visit = visitById.get(a.visit)!
        return (
          (kind === 'all' || a.kind === kind) &&
          (doctor === 'all' || visit.doctor === doctor) &&
          matchesAny(query, a.name, patientById.get(visit.patient)!.name, visit.patient)
        )
      }),
    [query, kind, doctor]
  )

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
        <Heading>Patient attachments</Heading>
        <Text className="mt-2">Files kept with patient records. Tap a file to open the visit it belongs to.</Text>
      </div>

      <ListFilters
        searchPlaceholder="Search file name, patient or ID"
        onSearch={changing(setQuery)}
        selects={[
          { label: 'File type', value: kind, onChange: changing(setKind), options: KIND_OPTIONS },
          { label: 'Doctor', value: doctor, onChange: changing(setDoctor), options: DOCTOR_OPTIONS },
        ]}
      />

      <div ref={pager.topRef} className="scroll-mt-4 space-y-4">
        <AttachmentList rows={pager.pageRows} onSelect={(a) => setSelected(visitById.get(a.visit) ?? null)} />
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
