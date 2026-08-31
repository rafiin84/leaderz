import FollowerDetailClient from './FollowerDetailClient'

export async function generateStaticParams() {
  return ['f-01','f-02','f-03','f-04','f-05','f-06','f-07','f-08','f-09','f-10'].map(id => ({ id }))
}

export default function FollowerDetailPage() {
  return <FollowerDetailClient />
}
