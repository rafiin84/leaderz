import ProjectDetailClient from './ProjectDetailClient'
import { MOCK_PROJECTS } from '@/data/mock/missions'

export async function generateStaticParams() {
  return Object.values(MOCK_PROJECTS)
    .flat()
    .map(p => ({ id: p.id }))
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />
}
