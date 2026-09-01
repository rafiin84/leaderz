'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash, MapPin, MapTrifold } from '@phosphor-icons/react'
import { Avatar } from '@/components/common/Avatar'
import { PhotoMetadataList } from './MissionUpdateDialog'
import { PhotoLocationDialog } from './PhotoLocationDialog'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatting'
import { formatFileSize } from '@/lib/photoMetadata'
import type { MissionUpdate } from '@/types/mission'

interface Props {
  update: MissionUpdate
  onRemove?: (id: string) => void
}

export function MissionUpdateCard({ update, onRemove }: Props) {
  const { metadata: meta } = update
  const [locationOpen, setLocationOpen] = useState(false)
  const hasCoords = meta?.latitude !== undefined && meta?.longitude !== undefined

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

      {update.photo && (
        <div className="relative">
          <img
            src={update.photo.url}
            alt={update.photo.caption ?? 'Mission update photo'}
            className="w-full max-h-96 object-cover"
          />
          {/* Map/location affordance — always offered so the "no GPS" case can
              explain itself rather than the control simply being absent. */}
          <button
            onClick={() => setLocationOpen(true)}
            title={hasCoords ? 'View location on map' : 'Location unavailable'}
            aria-label={hasCoords ? 'View photo location on map' : 'Photo location unavailable'}
            className={cn(
              'absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold backdrop-blur-sm transition-colors',
              hasCoords
                ? 'bg-black/65 text-white hover:bg-black/80'
                : 'bg-black/45 text-white/70 hover:bg-black/60'
            )}
          >
            {hasCoords ? <MapTrifold size={15} weight="fill" /> : <MapPin size={15} />}
            <span className="hidden sm:inline">{hasCoords ? 'View location' : 'No location'}</span>
          </button>
        </div>
      )}

      {/* Location, time and camera details captured from the photo */}
      {meta && (
        <div className="px-4 py-3 border-t bg-muted/30">
          <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-2">
            Photo details
          </h4>
          <PhotoMetadataList meta={meta} />
          {(meta.fileName || meta.fileSize) && (
            <p className="mt-2 text-[11px] text-muted-foreground truncate">
              {meta.fileName}
              {meta.fileSize ? ` · ${formatFileSize(meta.fileSize)}` : ''}
              {meta.mimeType ? ` · ${meta.mimeType}` : ''}
            </p>
          )}
        </div>
      )}
      <PhotoLocationDialog
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        meta={meta}
        photoName={update.photo?.caption}
      />
    </motion.article>
  )
}
