'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash, MapPin, MapTrifold } from '@phosphor-icons/react'
import { Avatar } from '@/components/common/Avatar'
import { PhotoLocationDialog } from './PhotoLocationDialog'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatting'
import type { MissionUpdate } from '@/types/mission'

interface Props {
  update: MissionUpdate
  onRemove?: (id: string) => void
}

export function MissionUpdateCard({ update, onRemove }: Props) {
  const photos = update.photos ?? []
  /** Index of the photo whose location dialog is open, or null for closed. */
  const [locationIndex, setLocationIndex] = useState<number | null>(null)
  const openPhoto = locationIndex === null ? null : photos[locationIndex] ?? null

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card overflow-hidden"
      aria-label={`Mission update by ${update.authorName}`}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <Avatar src={update.authorAvatar} name={update.authorName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{update.authorName}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(update.createdAt)}</p>
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(update.id)}
                aria-label="Delete update"
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
              >
                <Trash size={15} />
              </button>
            )}
          </div>
          {update.topicName && (
            <span className="inline-flex items-center mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {update.topicName}
            </span>
          )}
        </div>
      </div>

      {update.note && (
        <p className="px-4 pb-3 text-sm text-foreground leading-relaxed whitespace-pre-line">{update.note}</p>
      )}

      {photos.length > 0 && (
        <div
          className={cn(
            'grid gap-0.5',
            photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
          )}
        >
          {photos.map((p, i) => {
            const hasCoords = p.metadata?.latitude !== undefined && p.metadata?.longitude !== undefined
            return (
              <div key={p.media.id} className={cn('relative', photos.length === 1 ? '' : 'aspect-square')}>
                <img
                  src={p.media.url}
                  alt={p.media.caption ?? `Mission update photo ${i + 1}`}
                  className={cn('w-full object-cover', photos.length === 1 ? 'max-h-96' : 'h-full')}
                />
                {/* Per-photo location affordance — each shot can have its own
                    coordinates, and the "no GPS" case explains itself rather
                    than the control simply being absent. */}
                <button
                  onClick={() => setLocationIndex(i)}
                  title={hasCoords ? 'View location on map' : 'Location unavailable'}
                  aria-label={
                    hasCoords
                      ? `View location of photo ${i + 1} on map`
                      : `Location unavailable for photo ${i + 1}`
                  }
                  className={cn(
                    'absolute inline-flex items-center gap-1.5 rounded-full font-semibold backdrop-blur-sm transition-colors',
                    photos.length === 1
                      ? 'bottom-2 right-2 px-3 py-2 text-xs'
                      : 'bottom-1.5 right-1.5 p-2 text-[11px]',
                    hasCoords
                      ? 'bg-black/65 text-white hover:bg-black/80'
                      : 'bg-black/45 text-white/70 hover:bg-black/60'
                  )}
                >
                  {hasCoords ? <MapTrifold size={15} weight="fill" /> : <MapPin size={15} />}
                  {photos.length === 1 && (
                    <span className="hidden sm:inline">{hasCoords ? 'View location' : 'No location'}</span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Metadata is kept on each photo but not listed here — the map button
          surfaces the location, and the composer shows the full readout
          before posting. */}
      <PhotoLocationDialog
        open={openPhoto !== null}
        onClose={() => setLocationIndex(null)}
        meta={openPhoto?.metadata}
        photoName={openPhoto?.media.caption}
      />
    </motion.article>
  )
}
