import { LeaderBottomNav } from '@/components/navigation/LeaderBottomNav'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { PostComposer } from '@/components/content/PostComposer'
import { LeaderShell } from '@/components/layout/LeaderShell'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* w-fit keeps the row exactly as wide as its three columns, so mx-auto
          centres the whole design whether the sidebar is collapsed or not.
          The content column is a fixed width, so collapsing never resizes it. */}
      <div className="flex w-fit max-w-full mx-auto">
        <DesktopSidebar />
        <LeaderShell>{children}</LeaderShell>
      </div>
      <div className="md:hidden">
        <LeaderBottomNav />
      </div>
      <PostComposer />
      <NotificationDrawer />
    </div>
  )
}
