'use client'
import { Bell, MagnifyingGlass } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { usePosts } from '@/queries'
import { InlineComposer } from '@/components/content/InlineComposer'
import { PostCard } from '@/components/content/PostCard'
import { CardSkeleton } from '@/components/common/Skeleton'
import Link from 'next/link'

export default function HomePage() {
  const { activeTenantId } = useAppStore()
  const { data: posts, isLoading: postsLoading } = usePosts(activeTenantId)

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Home</h1>
          <div className="flex items-center gap-0.5">
            <Link href="/leader/contacts" className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Search">
              <MagnifyingGlass size={20} />
            </Link>
            <Link href="/leader/notifications" className="relative p-2 rounded-full hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-foreground rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      {/* Composer sits at the top of the feed */}
      <InlineComposer />

      {/* Latest feed — briefing, mission, attention and discovery now live in the right panel */}
      <section aria-label="Latest posts" className="px-4 py-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Latest</h2>
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {posts?.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </section>
    </div>
  )
}
