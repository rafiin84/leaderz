import ProjectDetailClient from './ProjectDetailClient'

export async function generateStaticParams() {
  return ['project-stellar', 'project-agri-ai'].map(id => ({ id }))
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />
}
