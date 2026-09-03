import { MOCK_OPPORTUNITIES } from '@/data/mock/missions'
import { OpportunityDetailClient } from './OpportunityDetailClient'

/** Static export needs every dynamic path up front. Derived from the mock data
 *  rather than hardcoded so new opportunities are picked up automatically. */
export async function generateStaticParams() {
  return Object.values(MOCK_OPPORTUNITIES)
    .flat()
    .map(o => ({ id: o.id }))
}

export default function OpportunityDetailPage() {
  return <OpportunityDetailClient />
}
