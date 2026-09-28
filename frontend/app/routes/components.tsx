import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FOLDER_TAB_BAR_CLASS, FOLDER_TAB_PANEL_CLASS, folderTabClass } from '~/components/FolderTabs'
import { MODAL_WIDTHS, Modal, type ModalWidth } from '~/components/Modal'
import { PageContainer } from '~/components/PageContainer'
import { ColumnFilter, ColumnHint, ColumnSort, TablePagination, TableSearchInput } from '~/components/TableControls'
import { Avatar } from '~/components/catalyst/avatar'
import { Button } from '~/components/catalyst/button'
import { Checkbox, CheckboxField, CheckboxGroup } from '~/components/catalyst/checkbox'
import { Divider } from '~/components/catalyst/divider'
import { Description, ErrorMessage, Field, FieldGroup, Fieldset, Label, Legend } from '~/components/catalyst/fieldset'
import { Heading, Subheading } from '~/components/catalyst/heading'
import { Input } from '~/components/catalyst/input'
import { Navbar, NavbarDivider, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from '~/components/catalyst/navbar'
import { Select } from '~/components/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableMessageRow, TableRow } from '~/components/catalyst/table'
import { Strong, Text, TextLink } from '~/components/catalyst/text'
import { Textarea } from '~/components/catalyst/textarea'
import type { Route } from './+types/components'

// The live style reference: every shared piece, used the way pages should use
// it. Server-rendered like any page, so nothing here reads window, storage,
// the clock or the locale while rendering.

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Components - MGMT6110 Problem Sets' }]
}

// Badges are inline spans, not a kit component (AWSC CONVENTIONS §12): copy the
// classes. Green/red is the status pill, amber a category tag, zinc neutral.
const BADGE = {
  neutral:
    'inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs/5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  category: 'inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-xs/5 font-medium text-amber-800',
  active: 'inline-flex items-center rounded-md bg-[#C6EFCE] px-1.5 py-0.5 text-xs/5 font-medium text-[#006100]',
  inactive: 'inline-flex items-center rounded-md bg-[#FFC7CE] px-1.5 py-0.5 text-xs/5 font-medium text-[#9C0006]',
}

// Status banners (AWSC CONVENTIONS §12). The success banner's dark half
// mirrors the error banner's; AWSC fixes only its light colours.
const ERROR_BANNER =
  'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm/6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400'
const SUCCESS_BANNER =
  'rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm/6 text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400'

type Status = 'open' | 'upcoming' | 'closed'

type ProblemSet = {
  code: string
  title: string
  tool: string
  status: Status
  /** ISO date, shown through `formatDate`. */
  due: string
}

// Sample rows for the table demo, not the course schedule: PS1's and PS8's
// tools are from the syllabus, the rest stay TBC, and every date is a placeholder.
const PROBLEM_SETS: ProblemSet[] = [
  { code: 'PS1', title: 'Problem set 1', tool: 'Claude Code', status: 'closed', due: '2026-09-01' },
  { code: 'PS2', title: 'Problem set 2', tool: 'TBC', status: 'closed', due: '2026-09-08' },
  { code: 'PS3', title: 'Problem set 3', tool: 'TBC', status: 'closed', due: '2026-09-15' },
  { code: 'PS4', title: 'Problem set 4', tool: 'TBC', status: 'closed', due: '2026-09-22' },
  { code: 'PS5', title: 'Problem set 5', tool: 'TBC', status: 'open', due: '2026-09-29' },
  { code: 'PS6', title: 'Problem set 6', tool: 'TBC', status: 'upcoming', due: '2026-10-06' },
  { code: 'PS7', title: 'Problem set 7', tool: 'TBC', status: 'upcoming', due: '2026-10-13' },
  { code: 'PS8', title: 'Problem set 8 (final)', tool: 'NotebookLM', status: 'upcoming', due: '2026-10-20' },
]

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_BADGE: Record<Status, string> = {
  open: BADGE.active,
  upcoming: BADGE.category,
  closed: BADGE.neutral,
}

const STATUS_RANK: Record<Status, number> = { open: 0, upcoming: 1, closed: 2 }

type Sort = 'code-asc' | 'code-desc' | 'open-first'

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'code-asc', label: 'PS1 to PS8' },
  { value: 'code-desc', label: 'PS8 to PS1' },
  { value: 'open-first', label: 'Open first' },
]

const DEFAULT_SORT: Sort = 'code-asc'

const PAGE_SIZE_OPTIONS = [3, 5, 10]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * "2026-09-01" -> "1 Sep 2026". String maths rather than Date/Intl, so the
 * server and the browser print the same text whatever their time zone or
 * locale - a difference there is a hydration mismatch.
 */
function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

function byCode(a: ProblemSet, b: ProblemSet) {
  return a.code.localeCompare(b.code, 'en', { numeric: true })
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={STATUS_BADGE[status]}>{STATUS_OPTIONS.find((o) => o.value === status)?.label}</span>
}

export default function Components() {
  // One Modal serves both a clicked table row and the Dialog section's button.
  const [selected, setSelected] = useState<ProblemSet | null>(null)
  const [demoOpen, setDemoOpen] = useState(false)
  const [width, setWidth] = useState<ModalWidth>('md')

  function closeModal() {
    setSelected(null)
    setDemoOpen(false)
  }

  return (
    <PageContainer className="space-y-12">
      <div>
        <Heading>Components</Heading>
        <Text className="mt-2">
          Every shared UI piece, rendered live - the style reference for problem-set pages. The kit is
          AWSC&apos;s customised Catalyst (Tailwind Plus): build pages from these pieces rather than raw
          markup, and check this page after any change to the kit.
        </Text>
      </div>

      <TypographySection />
      <ButtonsSection />
      <BadgesSection />
      <FormSection />
      <TableSection onSelect={setSelected} />
      <DialogSection width={width} onWidthChange={setWidth} onOpen={() => setDemoOpen(true)} />
      <AvatarDividerSection />
      <FolderTabsSection />
      <ShellSection />

      <Modal
        open={demoOpen || selected !== null}
        onClose={closeModal}
        title={selected ? `${selected.code} - ${selected.title}` : `Dialog at width="${width}"`}
        width={width}
      >
        {selected ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm/6">
            <dt className="text-zinc-500 dark:text-zinc-400">Tool</dt>
            <dd className="text-zinc-950 dark:text-white">{selected.tool}</dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd>
              <StatusBadge status={selected.status} />
            </dd>
            <dt className="text-zinc-500 dark:text-zinc-400">Due</dt>
            <dd className="tabular-nums text-zinc-950 dark:text-white">{formatDate(selected.due)}</dd>
          </dl>
        ) : (
          <Text>
            A dialog opens at one of five widths, each named for the max-width it sets. Pick by what the
            content is: a column of fields is <Code>md</Code>, a canvas or a card grid <Code>75vw</Code>.
          </Text>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button plain onClick={closeModal}>
            Close
          </Button>
          <Button color="danger" onClick={closeModal}>
            <TrashIcon data-slot="icon" />
            Delete
          </Button>
        </div>
      </Modal>
    </PageContainer>
  )
}

function Section({
  title,
  caption,
  children,
}: {
  title: string
  caption: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <Subheading>{title}</Subheading>
        <Text className="mt-1">{caption}</Text>
      </div>
      {children}
    </section>
  )
}

/** A component, prop or class name inside a caption. */
function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-zinc-950 dark:text-white">{children}</code>
}

function TypographySection() {
  return (
    <Section
      title="Typography"
      caption={
        <>
          <Code>Heading</Code> is the page title (one per screen), <Code>Subheading</Code> a section title,{' '}
          <Code>Text</Code> secondary prose. Colour prose only through <Code>tone</Code>: a colour class in{' '}
          <Code>className</Code> loses to the component&apos;s own zinc.
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Heading level={3}>Heading</Heading>
          <Subheading level={4}>Subheading</Subheading>
          <Text>
            Text in the default tone, with <Strong>Strong</Strong> for a lead-in or a figure, and a{' '}
            <TextLink href="/">TextLink</TextLink>.
          </Text>
          <Text tone="subtle">tone=&quot;subtle&quot; - metadata and fine print.</Text>
          <Text tone="warning">tone=&quot;warning&quot; - something to know before acting.</Text>
          <Text tone="danger">tone=&quot;danger&quot; - a failed or voided state.</Text>
        </div>
        <div className="space-y-1 text-zinc-950 dark:text-white">
          <p className="text-base/6">text-base/6 - emphasised inline text on dense screens</p>
          <p className="text-sm/6">text-sm/6 - the workhorse: body text, labels, table cells</p>
          <p className="text-xs/5">text-xs/5 - badges, counts, metadata; the 12px floor</p>
        </div>
      </div>
    </Section>
  )
}

const BUTTON_COLORS = ['zinc', 'white', 'brand', 'brand-strong', 'danger'] as const

function ButtonsSection() {
  return (
    <Section
      title="Buttons"
      caption={
        <>
          <Code>color=&quot;brand&quot;</Code> is the default action and <Code>brand-strong</Code> a
          landing-style CTA. <Code>danger</Code> is the one destructive treatment: solid to confirm,{' '}
          <Code>outline</Code> for the trigger, <Code>plain</Code> for a row action. Outline and plain
          ignore every other colour.
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {BUTTON_COLORS.map((color) => (
            <Button key={color} color={color}>
              {color}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button outline>outline</Button>
          <Button outline color="danger">
            outline danger
          </Button>
          <Button plain>plain</Button>
          <Button plain color="danger">
            plain danger
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button color="brand">
            <PlusIcon data-slot="icon" />
            With icon
          </Button>
          <Button color="brand" disabled>
            Disabled
          </Button>
          <Button outline href="/">
            Link via href
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-brand-strong p-4">
          <Button color="white">white on brand-strong</Button>
        </div>
      </div>
    </Section>
  )
}

function BadgesSection() {
  return (
    <Section
      title="Badges and banners"
      caption={
        <>
          Badges are inline spans, not a kit component - copy the classes from this file. Banners carry a
          page-level error or success.
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={BADGE.neutral}>Neutral</span>
          <span className={BADGE.category}>Category</span>
          <span className={BADGE.active}>Active</span>
          <span className={BADGE.inactive}>Inactive</span>
        </div>
        <p className="text-sm/6 text-zinc-500 line-through dark:text-zinc-400">
          A voided record kept as history is struck through in zinc.
        </p>
        <div className={ERROR_BANNER}>Error banner - something failed and the reader has to act.</div>
        <div className={SUCCESS_BANNER}>Success banner - the action went through.</div>
      </div>
    </Section>
  )
}

// Transform-free on purpose (no z.preprocess or .transform): input and output
// types then match, which keeps zodResolver's typing sound.
const formSchema = z.object({
  title: z.string().min(3, 'Enter at least 3 characters'),
  tool: z.string().min(1, 'Choose a tool'),
  notes: z.string().max(200, 'Keep notes to 200 characters'),
  confirm: z.boolean().refine((checked) => checked, 'Tick to confirm'),
})

type FormValues = z.infer<typeof formSchema>

const FORM_DEFAULTS: FormValues = { title: '', tool: '', notes: '', confirm: false }

const TOOL_OPTIONS = ['Claude Code', 'NotebookLM', 'Other']

function FormSection() {
  const [saved, setSaved] = useState<FormValues | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: FORM_DEFAULTS })

  return (
    <Section
      title="Form"
      caption={
        <>
          react-hook-form with a zod schema through <Code>zodResolver</Code>. Submit it empty to see every
          invalid state; a valid submit shows the success banner.
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit((values) => setSaved(values))} className="max-w-xl space-y-6">
        <Fieldset>
          <Legend>New problem set</Legend>
          <Text className="mt-1">Fields marked * are required.</Text>
          <FieldGroup>
            <Field>
              <Label htmlFor="ps-title">
                Title <span className="text-red-600 dark:text-red-500">*</span>
              </Label>
              <Input
                id="ps-title"
                {...register('title')}
                invalid={!!errors.title}
                placeholder="e.g. Problem set 9"
              />
              {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
            </Field>

            <Field>
              <Label htmlFor="ps-tool">
                Tool <span className="text-red-600 dark:text-red-500">*</span>
              </Label>
              <Description>The AI tool the problem set is built around.</Description>
              <Select id="ps-tool" {...register('tool')} invalid={!!errors.tool}>
                <option value="">Choose…</option>
                {TOOL_OPTIONS.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}
                  </option>
                ))}
              </Select>
              {errors.tool && <ErrorMessage>{errors.tool.message}</ErrorMessage>}
            </Field>

            <Field>
              <Label htmlFor="ps-notes">Notes</Label>
              <Textarea id="ps-notes" {...register('notes')} rows={3} />
              {errors.notes && <ErrorMessage>{errors.notes.message}</ErrorMessage>}
            </Field>

            <Field>
              <CheckboxGroup>
                <CheckboxField>
                  <Checkbox {...register('confirm')} />
                  Ready for review <span className="text-red-600 dark:text-red-500">*</span>
                </CheckboxField>
              </CheckboxGroup>
              {errors.confirm && <ErrorMessage>{errors.confirm.message}</ErrorMessage>}
            </Field>
          </FieldGroup>
        </Fieldset>

        <div className="flex gap-3">
          <Button type="submit" color="brand">
            Save
          </Button>
          <Button
            plain
            onClick={() => {
              reset()
              setSaved(null)
            }}
          >
            Reset
          </Button>
        </div>

        {saved && (
          <div className={SUCCESS_BANNER}>
            Saved &quot;{saved.title}&quot; ({saved.tool}).
          </div>
        )}
      </form>
    </Section>
  )
}

function TableSection({ onSelect }: { onSelect: (problemSet: ProblemSet) => void }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status[]>(STATUS_OPTIONS.map((o) => o.value))
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])

  const rows = useMemo(() => {
    const term = search.toLowerCase()
    return PROBLEM_SETS.filter(
      (ps) =>
        statusFilter.includes(ps.status) &&
        [ps.code, ps.title, ps.tool].some((value) => value.toLowerCase().includes(term))
    ).sort((a, b) => {
      if (sort === 'open-first') return STATUS_RANK[a.status] - STATUS_RANK[b.status] || byCode(a, b)
      return sort === 'code-desc' ? byCode(b, a) : byCode(a, b)
    })
  }, [search, statusFilter, sort])

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const isFiltered = search !== '' || statusFilter.length !== STATUS_OPTIONS.length

  return (
    <Section
      title="Table"
      caption={
        <>
          Every list goes through <Code>catalyst/table</Code> with the <Code>TableControls</Code> pieces. Search
          fires on Enter or half a second after typing, every control sends the table back to page 1, and a
          row with <Code>onClick</Code> (or <Code>href</Code>) is clickable. Sample rows with placeholder dates.
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full max-w-xs">
            <TableSearchInput
              placeholder="Search code, title or tool"
              onSearch={(term) => {
                setSearch(term)
                setPage(1)
              }}
            />
          </div>
        </div>

        <Table>
          <TableHead>
            {/* Every column but Title carries a pinned width (AWSC CONVENTIONS §11). */}
            <TableRow>
              <TableHeader className="w-24">
                <span className="inline-flex items-center gap-1">
                  Code
                  <ColumnSort
                    label="Code"
                    options={SORT_OPTIONS}
                    value={sort}
                    defaultValue={DEFAULT_SORT}
                    onChange={(next) => {
                      setSort(next)
                      setPage(1)
                    }}
                  />
                </span>
              </TableHeader>
              <TableHeader>Title</TableHeader>
              <TableHeader className="w-40">
                <span className="inline-flex items-center gap-1">
                  Tool
                  <ColumnHint text="The AI tool the problem set is built around - TBC until confirmed." />
                </span>
              </TableHeader>
              <TableHeader className="w-36">
                <span className="inline-flex items-center gap-1">
                  Status
                  <ColumnFilter
                    label="Status"
                    options={STATUS_OPTIONS}
                    selected={statusFilter}
                    onChange={(next) => {
                      setStatusFilter(next)
                      setPage(1)
                    }}
                  />
                </span>
              </TableHeader>
              <TableHeader className="w-32">Due</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableMessageRow colSpan={5}>
                {isFiltered ? 'No problem sets match the current search or filter.' : 'No problem sets yet.'}
              </TableMessageRow>
            ) : (
              pageRows.map((ps) => (
                <TableRow key={ps.code} onClick={() => onSelect(ps)} title={`${ps.code} - ${ps.title}`}>
                  <TableCell className="font-medium">{ps.code}</TableCell>
                  <TableCell>{ps.title}</TableCell>
                  <TableCell className={ps.tool === 'TBC' ? 'text-zinc-500 dark:text-zinc-400' : undefined}>
                    {ps.tool}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ps.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{formatDate(ps.due)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={setPage}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(next) => {
            setPageSize(next)
            setPage(1)
          }}
        />
      </div>
    </Section>
  )
}

const WIDTH_OPTIONS = Object.keys(MODAL_WIDTHS) as ModalWidth[]

function DialogSection({
  width,
  onWidthChange,
  onOpen,
}: {
  width: ModalWidth
  onWidthChange: (width: ModalWidth) => void
  onOpen: () => void
}) {
  return (
    <Section
      title="Dialog"
      caption={
        <>
          <Code>Modal</Code> is the one dialog. Size it with <Code>width</Code>, each value named for the
          max-width it sets (from <Code>sm</Code> up; a phone always gets the full width). A table row above
          opens the same dialog at the width chosen here.
        </>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-40">
          <Label htmlFor="modal-width">Width</Label>
          <Select id="modal-width" value={width} onChange={(e) => onWidthChange(e.target.value as ModalWidth)}>
            {WIDTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Button color="brand" onClick={onOpen}>
          Open dialog
        </Button>
      </div>
    </Section>
  )
}

function AvatarDividerSection() {
  return (
    <Section
      title="Avatar and divider"
      caption={
        <>
          <Code>Avatar</Code> shows a photo, initials, or a placeholder when it has neither; its size and fill
          come through <Code>className</Code>. <Code>Divider</Code> separates blocks, <Code>soft</Code> more
          quietly.
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar initials="PS" className="size-10 bg-brand text-white" />
          <Avatar initials="AB" className="size-10 bg-zinc-500 text-white" />
          <Avatar className="size-10 bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="space-y-3">
          <Text>Divider</Text>
          <Divider />
        </div>
        <div className="space-y-3">
          <Text>Divider soft</Text>
          <Divider soft />
        </div>
      </div>
    </Section>
  )
}

const FOLDER_TABS = [
  { label: 'Brief', body: 'What to build, what to hand in, and how it is marked.' },
  { label: 'Rubric', body: 'The criteria and the marks each one carries.' },
  { label: 'Submission', body: 'The files handed in and when they arrived.' },
]

function FolderTabsSection() {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <Section
      title="Folder tabs"
      caption={
        <>
          Tabs switched in place, as here, are Headless UI&apos;s <Code>TabGroup</Code> dressed with the{' '}
          <Code>FolderTabs</Code> classes. Tabs that are routes use <Code>FolderNavTabs</Code> in a layout
          route, with the child route rendered in its <Code>&lt;Outlet /&gt;</Code>.
        </>
      }
    >
      <TabGroup selectedIndex={tabIndex} onChange={setTabIndex}>
        <div className="overflow-x-auto">
          <TabList aria-label="Problem set" className={FOLDER_TAB_BAR_CLASS}>
            {FOLDER_TABS.map((tab, index) => (
              <Tab key={tab.label} className={folderTabClass(index === tabIndex)}>
                {tab.label}
              </Tab>
            ))}
          </TabList>
        </div>
        <TabPanels className={FOLDER_TAB_PANEL_CLASS}>
          {FOLDER_TABS.map((tab) => (
            <TabPanel key={tab.label} className="focus:outline-none">
              <Text>{tab.body}</Text>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </Section>
  )
}

function ShellSection() {
  return (
    <Section
      title="Shell"
      caption={
        <>
          Pages render inside <Code>SidebarLayout</Code>: the <Code>Sidebar</Code> sits on the left from 1280px
          up and collapses behind a menu button below that, where the <Code>Navbar</Code> fills the top bar. A
          standalone <Code>Navbar</Code> is below. <Code>AuthLayout</Code>, a centred card for sign-in-style
          pages, is the one copied component not shown here.
        </>
      }
    >
      <div className="rounded-lg px-4 ring-1 ring-zinc-950/5 dark:ring-white/10">
        <Navbar>
          <NavbarItem href="/">
            <img src="/favicon.svg" alt="" className="size-6" />
            <NavbarLabel>MGMT6110</NavbarLabel>
          </NavbarItem>
          <NavbarDivider />
          <NavbarSection>
            <NavbarItem href="/components" current>
              <NavbarLabel>Components</NavbarLabel>
            </NavbarItem>
            <NavbarItem href="/">
              <NavbarLabel>Home</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem aria-label="New problem set">
              <PlusIcon className="size-5" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      </div>
    </Section>
  )
}
