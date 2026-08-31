import ContactDetailClient from './ContactDetailClient'

export async function generateStaticParams() {
  return ['c-001','c-002','c-003','c-004','c-005','c-006','c-007','c-008'].map(id => ({ id }))
}

export default function ContactDetailPage() {
  return <ContactDetailClient />
}
