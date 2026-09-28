import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import clsx from 'clsx'

// The one dialog every page uses - lifted out of AWSC's patient-file
// primitives (AWSC CONVENTIONS §14) so it stands alone here.

/**
 * How wide a dialog opens, each key named for the max-width it sets so a
 * caller can see what it gets - pick by what the content is, not by how much
 * text it holds today. The viewport-relative size applies from `sm` up (a
 * phone gets the full width either way).
 */
export const MODAL_WIDTHS = {
  /** A single column of fields - the default, and what most dialogs want. */
  md: 'max-w-md',
  /** A wider column: a form or preview whose rows crowd the default. */
  '2xl': 'max-w-2xl',
  /** A form over a list: fields above rows that each carry several values. */
  '4xl': 'max-w-4xl',
  /** ~50% of the viewport, floored at `md`'s 28rem so a tablet-width window never gets less - fields over a table. */
  '50vw': 'sm:max-w-[max(28rem,50vw)]',
  /** ~75% of the viewport - a canvas, a card grid or a wide table rather than a column of fields. */
  '75vw': 'sm:max-w-[75vw]',
} as const

export type ModalWidth = keyof typeof MODAL_WIDTHS

export function Modal({
  open,
  onClose,
  title,
  width = 'md',
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  width?: ModalWidth
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-zinc-950/25 dark:bg-zinc-950/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={clsx(
            'max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10',
            MODAL_WIDTHS[width]
          )}
        >
          <DialogTitle className="text-lg/7 font-semibold text-zinc-950 dark:text-white">{title}</DialogTitle>
          <div className="mt-4">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
