'use client'
import { useRef, useState } from 'react'
import { CaretLeft, CaretRight, MapPin, MapTrifold } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { MissionPhoto } from '@/types/mission'

interface Props {
  photos: MissionPhoto[]
  /** Opens the location dialog for the photo at this index. */
  onOpenLocation: (index: number) => void
}

/** Horizontal distance that counts as a swipe rather than a tap. */
const SWIPE_PX = 40

/**
 * Photo slider for a mission update.
 *
 * One photo at a time with prev/next controls, a position counter, dot
 * indicators and touch swiping. The location button reflects the *current*
 * photo, since each shot carries its own coordinates.
 */
export function MissionPhotoCarousel({ photos, onOpenLocation }: Props) {
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)

  const count = photos.length
  const clamp = (i: number) => (i + count) % count
  const go = (delta: number) => setIndex(i => clamp(i + delta))

  const current = photos[index]
  const hasCoords =
    current?.metadata?.latitude !== undefined && current?.metadata?.longitude !== undefined

  return (
    <div
      className="relative select-none"
      role="group"
      aria-roledescription="carousel"
      aria-label={`Photo ${index + 1} of ${count}`}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
      }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) < SWIPE_PX || count < 2) return
        go(dx < 0 ? 1 : -1)
      }}
    >
      {/* Track — translated rather than re-mounted so images stay decoded */}
      <div className="overflow-hidden bg-muted">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((p, i) => (
            <img
              key={p.media.id}
              src={p.media.url}
              alt={p.media.caption ?? `Mission update photo ${i + 1}`}
              className="w-full shrink-0 max-h-96 object-cover"
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* Position counter */}
      {count > 1 && (
        <span
          className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/65 text-white text-[11px] font-semibold tabular-nums backdrop-blur-sm"
          aria-live="polite"
        >
          {index + 1}/{count}
        </span>
      )}

      {/* Prev / next */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 text-white hover:bg-black/75 transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 text-white hover:bg-black/75 transition-colors"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && count <= 8 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.media.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                i === index ? 'bg-white' : 'bg-white/45 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}

      {/* Location for the photo currently shown */}
      <button
        onClick={() => onOpenLocation(index)}
        title={hasCoords ? 'View location on map' : 'Location unavailable'}
        aria-label={
          hasCoords
            ? `View location of photo ${index + 1} on map`
            : `Location unavailable for photo ${index + 1}`
        }
        className={cn(
          'absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold backdrop-blur-sm transition-colors',
          hasCoords ? 'bg-black/65 text-white hover:bg-black/80' : 'bg-black/45 text-white/70 hover:bg-black/60'
        )}
      >
        {hasCoords ? <MapTrifold size={15} weight="fill" /> : <MapPin size={15} />}
        <span className="hidden sm:inline">{hasCoords ? 'View location' : 'No location'}</span>
      </button>
    </div>
  )
}
