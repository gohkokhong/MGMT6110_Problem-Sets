import {
  ATTACHMENTS,
  DOCTORS,
  PATIENTS,
  TODAY,
  VISITS,
  type Attachment,
  type Patient,
  type Visit,
} from '~/data/crm-data'

// Lookups and formatting over the invented data in `~/data/crm-data`. Built once
// at module load; nothing here reads the clock, locale or window, so the server
// and the browser print the same text (a difference breaks hydration).

export const doctorById = new Map(DOCTORS.map((d) => [d.id, d]))
export const patientById = new Map(PATIENTS.map((p) => [p.id, p]))
export const visitById = new Map(VISITS.map((v) => [v.id, v]))

/** Every visit, newest first (the data file lists them oldest first). */
export const VISITS_NEWEST_FIRST: Visit[] = [...VISITS].reverse()
export const TODAY_VISITS: Visit[] = VISITS_NEWEST_FIRST.filter((v) => v.date === TODAY)
export const PAST_VISITS: Visit[] = VISITS_NEWEST_FIRST.filter((v) => v.date !== TODAY)

/** Every attachment, newest visit first. */
export const ATTACHMENTS_NEWEST_FIRST: Attachment[] = [...ATTACHMENTS].reverse()

export const attachmentsByVisit = new Map<string, Attachment[]>()
for (const a of ATTACHMENTS) {
  const list = attachmentsByVisit.get(a.visit)
  if (list) list.push(a)
  else attachmentsByVisit.set(a.visit, [a])
}

export const visitsByPatient = new Map<string, Visit[]>()
for (const v of VISITS_NEWEST_FIRST) {
  const list = visitsByPatient.get(v.patient)
  if (list) list.push(v)
  else visitsByPatient.set(v.patient, [v])
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** "2026-09-01" -> "1 Sep 2026". String maths, so server and browser agree. */
export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

/** "2026-10-07" -> "Wed 7 Oct 2026". UTC maths, so the time zone cannot shift the weekday. */
export function formatLongDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return `${WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]} ${formatDate(iso)}`
}

/** Just the time for today's visits, date and time for older ones. */
export function formatWhen(visit: Visit) {
  return visit.date === TODAY ? visit.time : `${formatDate(visit.date)}, ${visit.time}`
}

/** 1193 -> "1,193". Written out because Intl output depends on the locale. */
export function formatCount(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** File size from kilobytes: "126 KB", "1.7 MB". */
export function formatSize(kb: number) {
  return kb < 1000 ? `${kb} KB` : `${(kb / 1000).toFixed(1)} MB`
}

export function ageOf(patient: Patient) {
  return Number(TODAY.slice(0, 4)) - patient.born
}

export function sexLabel(patient: Patient) {
  return patient.sex === 'F' ? 'Female' : 'Male'
}

/** "PT-0042 · 38 y · Female" */
export function patientSummary(patient: Patient) {
  return `${patient.id} · ${ageOf(patient)} y · ${sexLabel(patient)}`
}

/** Options for a "Doctor" select, first entry meaning no filter. */
export const DOCTOR_OPTIONS = [
  { value: 'all', label: 'All doctors' },
  ...DOCTORS.map((d) => ({ value: d.id, label: d.name })),
]

function dayNumber(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
}

/** True for today and the six days before it. */
export function isInLastWeek(iso: string) {
  return dayNumber(TODAY) - dayNumber(iso) < 7
}

/** Partial, case-insensitive match against any of the given texts. */
export function matchesAny(term: string, ...texts: string[]) {
  if (!term) return true
  const needle = term.toLowerCase()
  return texts.some((t) => t.toLowerCase().includes(needle))
}
