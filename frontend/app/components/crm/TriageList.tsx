import clsx from 'clsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/catalyst/table'
import { Text } from '~/components/catalyst/text'
import type { Visit } from '~/data/crm-data'
import { ageOf, doctorById, formatWhen, patientById, sexLabel } from '~/lib/crm'
import { StatusBadge, URGENCY_BAR, UrgencyBadge } from './badges'

const MUTED = 'text-zinc-500 dark:text-zinc-400'

/**
 * The triage results themselves. A table from 1024px up; below that each result
 * is a large tappable card, because a seven-column table cannot be read on a phone.
 * Choosing a result opens that visit.
 */
export function TriageList({ rows, onSelect }: { rows: Visit[]; onSelect: (visit: Visit) => void }) {
  if (rows.length === 0) return <Text className="py-6 text-center">No triage results match.</Text>

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="w-36">Urgency</TableHeader>
              <TableHeader className="w-48">Patient</TableHeader>
              <TableHeader>Complaint</TableHeader>
              <TableHeader className="w-56">Vitals</TableHeader>
              <TableHeader className="w-40">Doctor</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((v) => {
              const patient = patientById.get(v.patient)!
              return (
                <TableRow key={v.id} onClick={() => onSelect(v)} title={`Open visit for ${patient.name}`}>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <UrgencyBadge level={v.urgency} />
                      <StatusBadge status={v.status} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{patient.name}</div>
                    <div className={clsx('text-xs/5', MUTED)}>
                      {patient.id} · {ageOf(patient)} y · {sexLabel(patient)}
                    </div>
                  </TableCell>
                  <TableCell>{v.complaint}</TableCell>
                  <TableCell className="tabular-nums">
                    <div>
                      {v.temp.toFixed(1)} °C · BP {v.bp}
                    </div>
                    <div className={clsx('text-xs/5', MUTED)}>
                      HR {v.hr} · SpO₂ {v.spo2}% · Pain {v.pain}/10
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{doctorById.get(v.doctor)?.name}</div>
                    <div className={clsx('text-xs/5 tabular-nums', MUTED)}>Arrived {formatWhen(v)}</div>
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
                aria-label={`Open visit for ${patient.name}`}
                className={clsx(
                  'relative flex h-full w-full cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border border-zinc-200 bg-white py-4 pr-4 pl-5 text-left',
                  'hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  'dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                )}
              >
                <span aria-hidden="true" className={clsx('absolute inset-y-0 left-0 w-1.5', URGENCY_BAR[v.urgency])} />
                <span className="flex flex-wrap items-center gap-2">
                  <UrgencyBadge level={v.urgency} />
                  <StatusBadge status={v.status} />
                  <span className={clsx('ml-auto text-base/6 tabular-nums', MUTED)}>{formatWhen(v)}</span>
                </span>
                <span>
                  <span className="block text-base/6 font-semibold text-zinc-950 dark:text-white">{patient.name}</span>
                  <span className={clsx('block text-sm/6', MUTED)}>
                    {patient.id} · {ageOf(patient)} y · {sexLabel(patient)}
                  </span>
                </span>
                <span className="block text-base/6 text-zinc-950 dark:text-white">{v.complaint}</span>
                <span className={clsx('block text-sm/6 tabular-nums', MUTED)}>
                  {v.temp.toFixed(1)} °C · BP {v.bp} · HR {v.hr} · SpO₂ {v.spo2}% · Pain {v.pain}/10
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
