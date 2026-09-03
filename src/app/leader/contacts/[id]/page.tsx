import { MOCK_CONTACTS } from '@/data/mock/contacts'
import ContactDetailClient from './ContactDetailClient'

/** Derived from the data rather than hardcoded, so contacts added to the mock
 *  (including the personal ones) all get a detail page in the static export. */
export async function generateStaticParams() {
  return Object.values(MOCK_CONTACTS)
    .flat()
    .map(c => ({ id: c.id }))
}

export default function ContactDetailPage() {
  return <ContactDetailClient />
}
