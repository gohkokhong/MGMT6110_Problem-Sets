import { useClose } from '@headlessui/react'
import { ClipboardDocumentListIcon, PaperClipIcon, UserGroupIcon } from '@heroicons/react/20/solid'
import { Outlet, useLocation } from 'react-router'
import { BottomNav } from '~/components/crm/BottomNav'
import { SidebarLayout } from '~/components/catalyst/sidebar-layout'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '~/components/catalyst/sidebar'
import { Navbar, NavbarItem, NavbarLabel } from '~/components/catalyst/navbar'
import { Text } from '~/components/catalyst/text'

// The three screens. `short` is the label under the icon in the phone's bottom bar.
const SCREENS = [
  { href: '/triage', label: 'Triage results', short: 'Triage', icon: ClipboardDocumentListIcon },
  { href: '/records', label: 'Patient records', short: 'Records', icon: UserGroupIcon },
  { href: '/attachments', label: 'Patient attachments', short: 'Attachments', icon: PaperClipIcon },
]

/** A sidebar link that also shuts the phone's slide-out menu (a no-op in the desktop sidebar). */
function NavItem({ href, current, children }: { href: string; current?: boolean; children: React.ReactNode }) {
  const close = useClose()
  return (
    <SidebarItem href={href} current={current} onClick={() => close()}>
      {children}
    </SidebarItem>
  )
}

export default function AppLayout() {
  const { pathname } = useLocation()

  return (
    <SidebarLayout
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarSection>
              <NavItem href="/triage">
                <img src="/favicon.svg" alt="" className="size-6" />
                <SidebarLabel>CRM</SidebarLabel>
              </NavItem>
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {SCREENS.map(({ href, label, icon: Icon }) => (
                <NavItem key={href} href={href} current={pathname === href}>
                  <Icon data-slot="icon" />
                  <SidebarLabel>{label}</SidebarLabel>
                </NavItem>
              ))}
            </SidebarSection>
            <SidebarSpacer />
          </SidebarBody>

          <SidebarFooter>
            <Text tone="subtle" className="px-2">
              
            </Text>
          </SidebarFooter>
        </Sidebar>
      }
      navbar={
        <Navbar>
          <NavbarItem href="/triage">
            <img src="/favicon.svg" alt="" className="size-6" />
            <NavbarLabel>CRM</NavbarLabel>
          </NavbarItem>
        </Navbar>
      }
    >
      {/* Room at the bottom so the phone's bottom bar never covers the last row. */}
      <div className="pb-20 xl:pb-0">
        <Outlet />
      </div>
      <BottomNav items={SCREENS.map(({ href, short, icon }) => ({ href, label: short, icon }))} />
    </SidebarLayout>
  )
}
