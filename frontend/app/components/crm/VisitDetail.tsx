import { PaperClipIcon } from '@heroicons/react/20/solid'
import { Button } from '~/components/catalyst/button'
import { Subheading } from '~/components/catalyst/heading'
import { Text } from '~/components/catalyst/text'
import { Modal } from '~/components/Modal'
import { URGENCY_LEVELS, type Doctor, type Patient, type Visit } from '~/data/crm-data'
import {
  attachmentsByVisit,
  doctorById,
  formatDate,
  formatLongDate,
  formatSize,
  patientById,
  patientSummary,
  visitsByPatient,
} from '~/lib/crm'
import { FileName } from './FileName'
import { KindBadge, StatusBadge, UrgencyBadge } from './badges'

const EARLIER_VISITS_SHOWN = 5

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm/6 text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">{children}</dd>
    </div>
  )
}

/**
 * One visit in full: who, when, the triage result, the consultation record, the
 * files attached to it and the patient's earlier visits. Opened from a row on any
 * of the three screens; `visit` null keeps it closed.
 */
export function VisitDetail({ visit, onClose }: { visit: Visit | null; onClose: () => void }) {
  const patient = visit ? patientById.get(visit.patient) : undefined
  const doctor = visit ? doctorById.get(visit.doctor) : undefined

  return (
    <Modal open={Boolean(visit && patient)} onClose={onClose} title={patient?.name ?? ''} width="2xl">
      {visit && patient && doctor && <VisitBody visit={visit} patient={patient} doctor={doctor} onClose={onClose} />}
    </Modal>
  )
}

function VisitBody({
  visit,
  patient,
  doctor,
  onClose,
}: {
  visit: Visit
  patient: Patient
  doctor: Doctor
  onClose: () => void
}) {
  const urgency = URGENCY_LEVELS.find((u) => u.level === visit.urgency)
  const files = attachmentsByVisit.get(visit.id) ?? []
  const earlier = (visitsByPatient.get(visit.patient) ?? []).filter(
    (v) => v.date + v.time < visit.date + visit.time
  )

  const vitals = [
    { label: 'Temperature', value: `${visit.temp.toFixed(1)} °C` },
    { label: 'Blood pressure', value: `${visit.bp} mmHg` },
    { label: 'Heart rate', value: `${visit.hr} bpm` },
    { label: 'Oxygen (SpO₂)', value: `${visit.spo2}%` },
    { label: 'Pain', value: `${visit.pain} / 10` },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Text>{patientSummary(patient)}</Text>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Allergies">{patient.allergy}</Field>
          <Field label="Known conditions">{patient.conditions.length ? patient.conditions.join(', ') : 'None recorded'}</Field>
        </dl>
      </div>

      <section className="space-y-3">
        <Subheading level={3}>Visit</Subheading>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Arrived">
            {formatLongDate(visit.date)}, {visit.time}
          </Field>
          <Field label="Doctor">
            {doctor.name}
            <span className="block text-sm/6 text-zinc-500 dark:text-zinc-400">
              {doctor.specialty}, {doctor.room}
            </span>
          </Field>
          <Field label="Status">
            <StatusBadge status={visit.status} />
          </Field>
        </dl>
      </section>

      <section className="space-y-3">
        <Subheading level={3}>Triage result</Subheading>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <UrgencyBadge level={visit.urgency} />
          <Text>
            {urgency?.target} · triaged by Nurse {visit.nurse}
          </Text>
        </div>
        <dl className="space-y-3">
          <Field label="Complaint">{visit.complaint}</Field>
        </dl>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {vitals.map((v) => (
            <div key={v.label} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
              <dt className="text-sm/6 text-zinc-500 dark:text-zinc-400">{v.label}</dt>
              <dd className="text-base/6 font-medium text-zinc-950 tabular-nums dark:text-white">{v.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3">
        <Subheading level={3}>Consultation record</Subheading>
        {visit.diagnosis ? (
          <dl className="space-y-3">
            <Field label="Diagnosis">{visit.diagnosis}</Field>
            <Field label="Notes and plan">{visit.notes}</Field>
          </dl>
        ) : (
          <Text tone="subtle">
            {visit.status === 'waiting' ? 'Waiting to be seen. No record yet.' : 'Consultation in progress. No record yet.'}
          </Text>
        )}
      </section>

      <section className="space-y-3">
        <Subheading level={3}>Attachments ({files.length})</Subheading>
        {files.length === 0 ? (
          <Text tone="subtle">No files attached to this visit.</Text>
        ) : (
          <ul className="divide-y divide-zinc-950/5 rounded-lg ring-1 ring-zinc-950/5 dark:divide-white/5 dark:ring-white/10">
            {files.map((file) => (
              <li key={file.id} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
                <span className="flex min-w-0 flex-1 items-start gap-2 text-base/6 break-words text-zinc-950 sm:text-sm/6 dark:text-white">
                  <PaperClipIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-zinc-400 sm:size-4" />
                  <span className="min-w-0">
                    <FileName name={file.name} />
                  </span>
                </span>
                <span className="flex items-center gap-2 pl-7 sm:pl-0">
                  <KindBadge kind={file.kind} />
                  <span className="text-sm/6 text-zinc-500 tabular-nums dark:text-zinc-400">{formatSize(file.kb)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <Subheading level={3}>Earlier visits ({earlier.length})</Subheading>
        {earlier.length === 0 ? (
          <Text tone="subtle">No earlier visits on record.</Text>
        ) : (
          <>
            <ul className="divide-y divide-zinc-950/5 rounded-lg ring-1 ring-zinc-950/5 dark:divide-white/5 dark:ring-white/10">
              {earlier.slice(0, EARLIER_VISITS_SHOWN).map((v) => (
                <li key={v.id} className="px-3 py-2.5 text-base/6 sm:text-sm/6">
                  <div className="font-medium text-zinc-950 dark:text-white">{v.diagnosis || v.complaint}</div>
                  <div className="text-sm/6 text-zinc-500 dark:text-zinc-400">
                    {formatDate(v.date)} · {doctorById.get(v.doctor)?.name}
                  </div>
                </li>
              ))}
            </ul>
            {earlier.length > EARLIER_VISITS_SHOWN && (
              <Text tone="subtle">and {earlier.length - EARLIER_VISITS_SHOWN} more earlier visits.</Text>
            )}
          </>
        )}
      </section>

      <div className="flex justify-end">
        <Button color="brand" onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      </div>
    </div>
  )
}
