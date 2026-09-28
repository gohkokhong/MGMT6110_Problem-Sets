import { Outlet, useLocation } from 'react-router'
import { HomeIcon, SwatchIcon } from '@heroicons/react/20/solid'
import { SidebarLayout } from '~/components/catalyst/sidebar-layout'
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '~/components/catalyst/sidebar'
import { Navbar, NavbarSection, NavbarSpacer } from '~/components/catalyst/navbar'

export default function AppLayout() {
  const { pathname } = useLocation()

  return (
    <SidebarLayout
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarSection>
              <SidebarItem href="/">
                <img src="/favicon.svg" alt="" className="size-6" />
                <SidebarLabel>MGMT6110</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon data-slot="icon" />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/components" current={pathname === '/components'}>
                <SwatchIcon data-slot="icon" />
                <SidebarLabel>Components</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarSpacer />
          </SidebarBody>
        </Sidebar>
      }
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection />
        </Navbar>
      }
    >
      <Outlet />
    </SidebarLayout>
  )
}
