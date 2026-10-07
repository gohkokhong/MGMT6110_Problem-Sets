import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useMemo, useState } from 'react'
import { PageContainer } from '~/components/PageContainer'
import { FOLDER_TAB_BAR_CLASS, folderTabClass } from '~/components/FolderTabs'
import { TablePagination } from '~/components/TableControls'
import { Heading } from '~/components/catalyst/heading'
import { Text } from '~/components/catalyst/text'
import { ListFilters } from '~/components/crm/ListFilters'
import { RecordList } from '~/components/crm/RecordList'
import { VisitDetail } from '~/components/crm/VisitDetail'
import { TODAY, type Visit } from '~/data/crm-data'
import {
  DOCTOR_OPTIONS,
  PAST_VISITS,
  TODAY_VISITS,
  formatCount,
  formatLongDate,
  matchesAny,
  patientById,
} from '~/lib/crm'
import { usePagedList } from '~/lib/use-paged-list'
import type { Route } from './+types/records'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Patient records - CRM' }]
}

const TABS = [
  { label: 'Today', visits: TODAY_VISITS, count: formatCount(TODAY_VISITS.length) },
  { label: 'Past', visits: PAST_VISITS, count: formatCount(PAST_VISITS.length) },
]

// FolderTabs' panel pads 16px a side on a phone, which squeezes the cards; tighter there.
const PANEL_CLASS =
  'rounded-b-xl border-x border-b border-zinc-200 bg-white px-3 py-4 sm:px-6 sm:py-8 dark:border-zinc-700 dark:bg-zinc-900'

/** Screen 2: patient records, today's visits and past ones on two tabs. */
export default function Records() {
  const [tab, setTab] = useState(0)
  const [query, setQuery] = useState('')
  const [doctor, setDoctor] = useState('all')
  const [selected, setSelected] = useState<Visit | null>(null)

  const scope = TABS[tab].visits
  const rows = useMemo(
    () =>
      scope.filter(
        (v) =>
          (doctor === 'all' || v.doctor === doctor) &&
          matchesAny(query, patientById.get(v.patient)!.name, v.patient, v.diagnosis, v.complaint)
      ),
    [scope, doctor, query]
  )

  const pager = usePagedList(rows)

  const panel = (
    <div className="space-y-4">
      <ListFilters
        searchPlaceholder="Search patient, ID or diagnosis"
        onSearch={(term) => {
          setQuery(term)
          pager.reset()
        }}
        selects={[
          {
            label: 'Doctor',
            value: doctor,
            onChange: (v) => {
              setDoctor(v)
              pager.reset()
            },
            options: DOCTOR_OPTIONS,
          },
        ]}
      />
      <div ref={pager.topRef} className="scroll-mt-4 space-y-4">
        <RecordList rows={pager.pageRows} onSelect={setSelected} />
        <TablePagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={rows.length}
          onPageChange={pager.goTo}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={pager.changePageSize}
        />
      </div>
    </div>
  )

  return (
    <PageContainer className="space-y-6">
      <div>
        <Heading>Patient records</Heading>
        <Text className="mt-2">
          Visits today ({formatLongDate(TODAY)}) and every visit before. Tap a record to open it.
        </Text>
      </div>

      <TabGroup
        selectedIndex={tab}
        onChange={(index) => {
          setTab(index)
          pager.reset()
        }}
      >
        <div className="overflow-x-auto">
          <TabList aria-label="Records" className={FOLDER_TAB_BAR_CLASS}>
            {TABS.map((t, index) => (
              <Tab key={t.label} className={folderTabClass(index === tab)}>
                {t.label} ({t.count})
              </Tab>
            ))}
          </TabList>
        </div>
        <TabPanels className={PANEL_CLASS}>
          {TABS.map((t) => (
            <TabPanel key={t.label} className="focus:outline-none">
              {panel}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>

      <VisitDetail visit={selected} onClose={() => setSelected(null)} />
    </PageContainer>
  )
}
