import EventDetailClient from './EventDetailClient'

export async function generateStaticParams() {
  return ['event-1', 'event-2', 'event-a1'].map(id => ({ id }))
}

export default function EventDetailPage() {
  return <EventDetailClient />
}
