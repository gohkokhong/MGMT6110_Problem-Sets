import { PaperClipIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/catalyst/table'
import { Text } from '~/components/catalyst/text'
import { TODAY, type Visit } from '~/data/crm-data'
import { attachmentsByVisit, doctorById, formatDate, patientById, patientSummary } from '~/lib/crm'
import { StatusBadge } from './badges'

const MUTED = 'text-zinc-500 dark:text-zinc-400'

/** What the doctor concluded, or where the visit is up to when there is no conclusion yet. */
function headline(v: Visit) {
  if (v.diagnosis) return v.diagnosis
  return v.status === 'waiting' ? 'Waiting to be seen' : 'Consultation in progress'
}

/** Today's records show the arrival time; older ones show the date as well. */
function when(v: Visit) {
  return v.date === TODAY ? v.time : formatDate(v.date)
}

function FileCount({ visitId }: { visitId: string }) {
  const n = attachmentsByVisit.get(visitId)?.length ?? 0
  if (n === 0) return <span className={MUTED}>-</span>
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <PaperClipIcon aria-hidden="true" className="size-4 text-zinc-400" />
      {n}
      <span className="sr-only">{n === 1 ? 'attachment' : 'attachments'}</span>
    </span>
  )
}

/**
 * Patient records, one row per visit. A table from 1024px up, large tappable
 * cards below that. Choosing a record opens that visit.
 */
export function RecordList({ rows, onSelect }: { rows: Visit[]; onSelect: (visit: Visit) => void }) {
  if (rows.length === 0) return <Text className="py-6 text-center">No records match.</Text>

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="w-32">When</TableHeader>
              <TableHeader className="w-56">Patient</TableHeader>
              <TableHeader>Diagnosis</TableHeader>
              <TableHeader className="w-44">Doctor</TableHeader>
              <TableHeader className="w-24">Files</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((v) => {
              const patient = patientById.get(v.patient)!
              return (
                <TableRow key={v.id} onClick={() => onSelect(v)} title={`Open record for ${patient.name}`}>
                  <TableCell className="tabular-nums">
                    <div>{when(v)}</div>
                    {v.date === TODAY ? (
                      <StatusBadge status={v.status} />
                    ) : (
                      <div className={clsx('text-xs/5', MUTED)}>{v.time}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{patient.name}</div>
                    <div className={clsx('text-xs/5', MUTED)}>{patientSummary(patient)}</div>
                  </TableCell>
                  <TableCell>
                    <div className={v.diagnosis ? undefined : MUTED}>{headline(v)}</div>
                    <div className={clsx('text-xs/5', MUTED)}>{v.complaint}</div>
                  </TableCell>
                  <TableCell>{doctorById.get(v.doctor)?.name}</TableCell>
                  <TableCell>
                    <FileCount visitId={v.id} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
        {rows.map((v) => {
          const patient = patientById.get(v.patient)!
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onSelect(v)}
                aria-label={`Open record for ${patient.name}`}
                className={clsx(
                  'flex h-full w-full cursor-pointer flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-left',
                  'hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  'dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                )}
              >
                <span className="flex flex-wrap items-center gap-2">
                  {v.date === TODAY && <StatusBadge status={v.status} />}
                  <span className={clsx('text-base/6 tabular-nums', MUTED)}>
                    {v.date === TODAY ? `Today, ${v.time}` : `${formatDate(v.date)}, ${v.time}`}
                  </span>
                  <span className="ml-auto text-base/6 text-zinc-950 dark:text-white">
                    <FileCount visitId={v.id} />
                  </span>
                </span>
                <span>
                  <span className="block text-base/6 font-semibold text-zinc-950 dark:text-white">{patient.name}</span>
                  <span className={clsx('block text-sm/6', MUTED)}>{patientSummary(patient)}</span>
                </span>
                <span className={clsx('block text-base/6', v.diagnosis ? 'text-zinc-950 dark:text-white' : MUTED)}>
                  {headline(v)}
                </span>
                <span className={clsx('block text-sm/6', MUTED)}>{doctorById.get(v.doctor)?.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
