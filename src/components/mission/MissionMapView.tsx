'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapTrifold, CaretRight } from '@phosphor-icons/react'
import { MissionMap, useMissionMapData, MARKER_RED, type Pin } from './MissionMap'
import type { LocationCluster } from '@/lib/clusterLocations'
import { formatRelativeTime } from '@/lib/formatting'
import type { MissionUpdate } from '@/types/mission'

interface Props {
  open: boolean
  onClose: () => void
  updates: MissionUpdate[]
}

/**
 * Expanded, full-screen view of the mission map.
 *
 * The map canvas lives in MissionMap, shared with the version embedded on the
 * Mission page; this adds the header summary and the list of posts behind a
 * tapped marker.
 */
export function MissionMapView({ open, onClose, updates }: Props) {
  const [selected, setSelected] = useState<LocationCluster<Pin> | null>(null)
  const [showSamples, setShowSamples] = useState(true)

  const { clusters, samples, pinnedPostCount } = useMissionMapData(updates, showSamples)
  const missingCount = updates.length - pinnedPostCount

  const close = useCallback(() => {
    setSelected(null)
    onClose()
  }, [onClose])

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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="map-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            key="map-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mission map"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-8 z-50 md:inset-0 md:m-auto md:h-[86vh] md:w-[min(900px,92vw)] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          >
            <div className="flex items-start gap-3 px-4 py-3 border-b shrink-0">
              <MapTrifold size={18} weight="fill" className="mt-0.5 shrink-0" style={{ color: MARKER_RED }} />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground">Mission map</h2>
                <p className="text-[11px] text-muted-foreground">
                  {pinnedPostCount === 0
                    ? 'No located posts yet'
                    : `${pinnedPostCount} post${pinnedPostCount > 1 ? 's' : ''} across ${clusters.length} location${clusters.length > 1 ? 's' : ''}`}
                  {missingCount > 0 && ` · ${missingCount} without location`}
                  {samples.length > 0 && ` · ${samples.length} sample states`}
                </p>
              </div>
              <button
                onClick={() => setShowSamples(v => !v)}
                aria-pressed={showSamples}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border hover:bg-muted transition-colors"
              >
                {showSamples ? 'Hide samples' : 'Show samples'}
              </button>
              <button
                onClick={close}
                aria-label="Close"
                className="shrink-0 p-2 -mr-2 -mt-1 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <MissionMap
              updates={updates}
              showSamples={showSamples}
              onSelectCluster={setSelected}
              resizeKey={selected ? 'open' : 'closed'}
              focus={selected}
              className="relative flex-1 min-h-0 bg-muted"
            />

            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="shrink-0 border-t bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selected.placeName ?? 'Selected location'}
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        {selected.items.length} post{selected.items.length > 1 ? 's' : ''}
                      </span>
                    </p>
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Close location list"
                      className="p-1.5 -mr-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <ul
                    className="max-h-44 overflow-y-auto px-4 pb-3 space-y-1"
                    style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
                  >
                    {selected.items.map((pin, i) => {
                      const photo = pin.update.photos?.[pin.photoIndex]
                      return (
                        <li key={`${pin.update.id}-${pin.photoIndex}-${i}`}>
                          <div className="flex items-center gap-3 py-2">
                            {photo && (
                              <img src={photo.media.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{pin.update.note ?? 'Field update'}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatRelativeTime(pin.update.createdAt)}
                                {pin.placeName ? ` · ${pin.placeName}` : ''}
                              </p>
                            </div>
                            <CaretRight size={13} className="shrink-0 text-muted-foreground" />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
