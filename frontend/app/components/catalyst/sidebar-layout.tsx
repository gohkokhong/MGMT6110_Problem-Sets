import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid'

export function SidebarLayout({
  navbar,
  sidebar,
  children,
}: React.PropsWithChildren<{
  navbar: React.ReactNode
  sidebar: React.ReactNode
}>) {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="relative isolate flex min-h-svh w-full bg-white max-xl:flex-col xl:bg-zinc-100 dark:bg-zinc-900 dark:xl:bg-zinc-950">
      {/* Mobile sidebar overlay */}
      <Dialog open={showSidebar} onClose={setShowSidebar} className="xl:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 transition data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
        />
        <DialogPanel
          transition
          className="fixed inset-y-0 left-0 w-full max-w-80 p-2 transition duration-300 ease-in-out data-[closed]:-translate-x-full"
        >
          <div className="flex h-full flex-col rounded-3xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="-mb-3 px-4 pt-3">
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                aria-label="Close navigation"
                className="flex size-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5 cursor-pointer"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
            {sidebar}
          </div>
        </DialogPanel>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 max-xl:hidden">
        <div className="flex h-full flex-col border-r border-zinc-950/5 bg-white dark:border-white/5 dark:bg-zinc-900">
          {sidebar}
        </div>
      </div>

      {/* Mobile header */}
      <header className="flex items-center px-4 xl:hidden">
        <div className="py-2.5">
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            aria-label="Open navigation"
            className="flex size-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5 cursor-pointer"
          >
            <Bars3Icon className="size-6" />
          </button>
        </div>
        <div className="min-w-0 flex-1">{navbar}</div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col xl:min-w-0 xl:pl-64">
        <div className="grow p-6 xl:bg-white xl:p-10 xl:shadow-sm xl:ring-1 xl:ring-zinc-950/5 dark:xl:bg-zinc-900 dark:xl:ring-white/10">
          {children}
        </div>
      </main>
    </div>
  )
}
