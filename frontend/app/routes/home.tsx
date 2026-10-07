import { PageContainer } from '~/components/PageContainer'
import { Heading } from '~/components/catalyst/heading'
import { Text, TextLink } from '~/components/catalyst/text'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Home - MGMT6110 Problem Sets' }]
}

export default function Home() {
  return (
    <PageContainer className="space-y-6">
      <div>
        <Heading>MGMT6110 Problem Sets</Heading>
        <Text className="mt-2">
          Problem-set pages will live here. Build them from the shared kit shown on the{' '}
          <TextLink href="/components">component showcase</TextLink>.
        </Text>
      </div>
    </PageContainer>
  )
}
