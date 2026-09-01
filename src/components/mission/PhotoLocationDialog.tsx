'use client'
import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ArrowSquareOut, WarningCircle } from '@phosphor-icons/react'
import { formatCoords } from '@/lib/photoMetadata'
import { PhotoMap } from './PhotoMap'
import type { PhotoMetadata } from '@/types/mission'

interface Props {
  open: boolean
  onClose: () => void
  meta?: PhotoMetadata
  /** Shown as the dialog subtitle so the user knows which photo this is. */
  photoName?: string
}

/**
 * Shows where a photo was taken on an interactive map.
 *
 * The map (see PhotoMap) pans and zooms and drops a marker on the exact
 * coordinates. When the photo has no GPS — a canvas camera snapshot, or EXIF
 * stripped by a messaging app — it says so plainly, with the reasons, instead
 * of guessing a location.
 */
export function PhotoLocationDialog({ open, onClose, meta, photoName }: Props) {
  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  const lat = meta?.latitude
  const lon = meta?.longitude
  const hasCoords = lat !== undefined && lon !== undefined

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="loc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            key="loc-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Photo location"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[620px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border flex flex-col max-h-[90dvh]"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3 border-b shrink-0">
              <MapPin size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground">Photo location</h2>
                {photoName && <p className="text-[11px] text-muted-foreground truncate">{photoName}</p>}
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="shrink-0 p-2 -mr-2 -mt-1 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="overflow-y-auto"
              style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
            >
              {hasCoords ? (
                <>
                  {/* Interactive map — height scales with the viewport */}
                  <PhotoMap
                    latitude={lat!}
                    longitude={lon!}
                    label={meta?.placeName}
                    className="relative bg-muted h-[45vh] min-h-[240px] md:h-80"
                  />

                  <div className="px-4 py-3 space-y-2">
                    {meta?.placeName && (
                      <p className="text-sm font-medium text-foreground">{meta.placeName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatCoords(lat!, lon!)}
                      {meta?.altitude !== undefined && ` · ${Math.round(meta.altitude)}m elevation`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {meta?.locationSource === 'device'
                        ? 'Coordinates come from this device at upload time, not from the photo itself.'
                        : 'Coordinates read from the photo’s GPS metadata.'}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
                      >
                        <ArrowSquareOut size={13} />
                        OpenStreetMap
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
                      >
                        <ArrowSquareOut size={13} />
                        Google Maps
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-4 py-6">
                  <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                    <WarningCircle size={20} className="shrink-0 mt-0.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Photo location could not be detected
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        This photo carries no GPS coordinates, so there is nothing to place on a map.
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                        <li>Photos taken with the in-page camera have no GPS — the browser cannot write EXIF.</li>
                        <li>Messaging apps and screenshots usually strip location data.</li>
                        <li>The camera may have had location services turned off.</li>
                      </ul>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        To record a position, use <span className="font-medium text-foreground">Use my current
                        location</span> in the update dialog before posting, or attach a photo straight from a
                        phone with location enabled.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
