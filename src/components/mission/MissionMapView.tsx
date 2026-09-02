'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapTrifold, CaretRight, ArrowLeft } from '@phosphor-icons/react'
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
            key="map-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mission map"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-card flex flex-col overflow-hidden"
          >
            <div className="flex items-start gap-3 px-4 py-3 border-b shrink-0">
              <button
                onClick={close}
                aria-label="Back to mission"
                className="shrink-0 p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
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
                aria-label="Back to mission"
                className="shrink-0 p-2 -mr-2 -mt-1 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 min-h-0">
              <MissionMap
                updates={updates}
                showSamples={showSamples}
                onSelectCluster={setSelected}
                resizeKey={selected ? 'open' : 'closed'}
                focus={selected}
                className="relative w-full h-full bg-muted"
              />
              {/* Legend sits above the isolated map, so a low z-index suffices. */}
              <div className="absolute bottom-2 left-2 z-10 rounded-lg border bg-card/95 backdrop-blur-sm px-2.5 py-2 text-[11px] space-y-1 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" style={{ background: MARKER_RED }} />
                  <span className="text-foreground">Mission posts</span>
                </span>
                {samples.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed bg-white" style={{ borderColor: MARKER_RED }} />
                    <span className="text-muted-foreground">Sample state</span>
                  </span>
                )}
              </div>
            </div>

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
