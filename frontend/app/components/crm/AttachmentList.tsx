import {
  BeakerIcon,
  CameraIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  HeartIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/catalyst/table'
import { Text } from '~/components/catalyst/text'
import type { Attachment, AttachmentKind } from '~/data/crm-data'
import { doctorById, formatDate, formatSize, patientById, visitById } from '~/lib/crm'
import { FileName } from './FileName'
import { KindBadge } from './badges'

const MUTED = 'text-zinc-500 dark:text-zinc-400'

const KIND_ICON: Record<AttachmentKind, React.ComponentType<React.ComponentPropsWithoutRef<'svg'>>> = {
  lab: BeakerIcon,
  xray: PhotoIcon,
  ecg: HeartIcon,
  ultrasound: PhotoIcon,
  referral: DocumentTextIcon,
  cert: ClipboardDocumentCheckIcon,
  photo: CameraIcon,
  consent: ClipboardDocumentCheckIcon,
  vaccine: ShieldCheckIcon,
}

/**
 * Files attached to patient records, one row per file. A table from 1024px up,
 * large tappable cards below that. Choosing a file opens the visit it belongs to.
 */
export function AttachmentList({
  rows,
  onSelect,
}: {
  rows: Attachment[]
  onSelect: (attachment: Attachment) => void
}) {
  if (rows.length === 0) return <Text className="py-6 text-center">No attachments match.</Text>

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>File</TableHeader>
              <TableHeader className="w-52">Patient</TableHeader>
              <TableHeader className="w-32">Visit date</TableHeader>
              <TableHeader className="w-44">Doctor</TableHeader>
              <TableHeader className="w-24">Size</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((a) => {
              const visit = visitById.get(a.visit)!
              const patient = patientById.get(visit.patient)!
              const Icon = KIND_ICON[a.kind]
              return (
                <TableRow key={a.id} onClick={() => onSelect(a)} title={`Open visit for ${a.name}`}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                      <div className="min-w-0">
                        <div className="font-medium break-words">
                          <FileName name={a.name} />
                        </div>
                        <div className="mt-0.5">
                          <KindBadge kind={a.kind} />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{patient.name}</div>
                    <div className={clsx('text-xs/5', MUTED)}>{patient.id}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{formatDate(visit.date)}</TableCell>
                  <TableCell>{doctorById.get(visit.doctor)?.name}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{formatSize(a.kb)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
        {rows.map((a) => {
          const visit = visitById.get(a.visit)!
          const patient = patientById.get(visit.patient)!
          const Icon = KIND_ICON[a.kind]
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(a)}
                aria-label={`Open visit for ${a.name}`}
                className={clsx(
                  'flex h-full w-full cursor-pointer flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-left',
                  'hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  'dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                )}
              >
                <span className="flex items-start gap-2 text-base/6 font-semibold break-words text-zinc-950 dark:text-white">
                  <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-zinc-400" />
                  <span className="min-w-0">
                    <FileName name={a.name} />
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <KindBadge kind={a.kind} />
                  <span className={clsx('text-sm/6 tabular-nums', MUTED)}>{formatSize(a.kb)}</span>
                </span>
                <span className="text-base/6 text-zinc-950 dark:text-white">
                  {patient.name}
                  <span className={clsx('block text-sm/6', MUTED)}>
                    {patient.id} · Visit {formatDate(visit.date)}
                  </span>
                </span>
                <span className={clsx('block text-sm/6', MUTED)}>{doctorById.get(visit.doctor)?.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
