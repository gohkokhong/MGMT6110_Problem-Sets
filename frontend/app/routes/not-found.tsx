import { data } from 'react-router'
import { PageContainer } from '~/components/PageContainer'
import { Heading } from '~/components/catalyst/heading'
import { Text } from '~/components/catalyst/text'
import type { Route } from './+types/not-found'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Page not found - MGMT6110 Problem Sets' }]
}

// Returned, not thrown: the document still goes out as HTTP 404, but the page
// renders inside the sidebar shell. A thrown 404 would land in root's
// ErrorBoundary instead, which replaces the whole app.
export function loader() {
  return data(null, { status: 404 })
}

export default function NotFound() {
  return (
    <PageContainer className="space-y-6">
      <div>
        <Heading>Page not found</Heading>
        <Text className="mt-2">This page doesn't exist or hasn't been built yet.</Text>
      </div>
    </PageContainer>
  )
}
