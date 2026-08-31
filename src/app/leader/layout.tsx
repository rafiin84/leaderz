import { LeaderBottomNav } from '@/components/navigation/LeaderBottomNav'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { PostComposer } from '@/components/content/PostComposer'
import { RightPanel } from '@/components/layout/RightPanel'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full max-w-[1280px] mx-auto">
        <DesktopSidebar />
        <main className="flex-1 min-w-0">
          <div className="has-bottom-nav md:pb-0">
            {children}
          </div>
        </main>
        <RightPanel />
      </div>
      <div className="md:hidden">
        <LeaderBottomNav />
      </div>
      <PostComposer />
      <NotificationDrawer />
    </div>
  )
}
