'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash } from '@phosphor-icons/react'
import { Avatar } from '@/components/common/Avatar'
import { PhotoLocationDialog } from './PhotoLocationDialog'
import { MissionPhotoCarousel } from './MissionPhotoCarousel'
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
        <MissionPhotoCarousel photos={photos} onOpenLocation={setLocationIndex} />
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
