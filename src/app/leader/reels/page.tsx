'use client'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useReels } from '@/queries'
import { ReelCard } from '@/components/reels/ReelCard'
import { Skeleton } from '@/components/common/Skeleton'

export default function ReelsPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: reels, isLoading } = useReels(activeTenantId)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(idx)
          }
        })
      },
      { threshold: 0.6, root: container }
    )

    const slides = container.querySelectorAll('[data-index]')
    slides.forEach(slide => observer.observe(slide))
    return () => observer.disconnect()
  }, [reels])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (!reels?.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-white text-center px-8">No Reels yet. Create your first one.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="reels-scroll overflow-y-scroll h-screen md:h-[calc(100vh-1px)] snap-y snap-mandatory"
      aria-label="Reels"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {reels.map((reel, i) => (
        <div
          key={reel.id}
          data-index={i}
          className="snap-start h-screen w-full relative"
          style={{ scrollSnapAlign: 'start' }}
        >
          <ReelCard reel={reel} isActive={i === activeIndex} />
        </div>
      ))}
    </div>
  )
}
