'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapTrifold, WarningCircle, Spinner, CaretRight } from '@phosphor-icons/react'
import { groupByState, INDIA_BOUNDS, type LocationCluster } from '@/lib/clusterLocations'
import { SAMPLE_STATE_MARKERS } from '@/data/mock/missionMapSamples'
import { formatRelativeTime } from '@/lib/formatting'
import type { MissionUpdate } from '@/types/mission'
import 'leaflet/dist/leaflet.css'

/** Markers are red so they stand out against OSM's green/beige tiles. */
const MARKER_RED = '#dc2626'
const MARKER_RED_HALO = 'rgba(220,38,38,0.25)'

interface Props {
  open: boolean
  onClose: () => void
  updates: MissionUpdate[]
}

/** One post pinned at one of its photos' coordinates. A post with photos in
 *  two places legitimately appears at both. */
interface Pin {
  update: MissionUpdate
  photoIndex: number
  latitude: number
  longitude: number
  placeName?: string
  stateName?: string
}

/**
 * India-wide map of every geotagged mission post.
 *
 * Posts are clustered by proximity (see clusterByLocation), so several updates
 * from the same town collapse into one marker carrying a count; clicking a
 * marker lists the posts behind it.
 *
 * Leaflet with OpenStreetMap raster tiles — raster rather than vector so the
 * map does not require WebGL.
 */
export function MissionMapView({ open, onClose, updates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [selected, setSelected] = useState<LocationCluster<Pin> | null>(null)
  const [showSamples, setShowSamples] = useState(true)

  const close = useCallback(() => {
    setSelected(null)
    setStatus('loading')
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

  const pins = useMemo<Pin[]>(() => {
    const out: Pin[] = []
    for (const u of updates) {
      ;(u.photos ?? []).forEach((p, i) => {
        const { latitude, longitude, placeName, stateName } = p.metadata ?? {}
        if (latitude === undefined || longitude === undefined) return
        out.push({ update: u, photoIndex: i, latitude, longitude, placeName, stateName })
      })
    }
    return out
  }, [updates])

  // One dot per state, which is how mission activity reads nationally.
  const clusters = useMemo(
    () => groupByState(pins, p => p, p => p.stateName, p => p.placeName, 25),
    [pins]
  )

  /** Sample dots are suppressed for any state that already has real posts, so
   *  demonstration data never sits on top of actual activity. */
  const realStates = useMemo(
    () => new Set(clusters.map(c => c.placeName?.toLowerCase()).filter(Boolean)),
    [clusters]
  )
  const samples = useMemo(
    () => (showSamples ? SAMPLE_STATE_MARKERS.filter(m => !realStates.has(m.stateName.toLowerCase())) : []),
    [showSamples, realStates]
  )

  /** Distinct posts represented on the map (a post can pin more than once). */
  const pinnedPostCount = useMemo(
    () => new Set(pins.map(p => p.update.id)).size,
    [pins]
  )
  const missingCount = updates.length - pinnedPostCount

  // Signature keeps the map from tearing down on unrelated re-renders.
  const signature = useMemo(
    () =>
      clusters.map(c => `${c.latitude.toFixed(4)},${c.longitude.toFixed(4)}:${c.items.length}`).join('|') +
      '#' + samples.map(m => m.stateName).join(','),
    [clusters, samples]
  )

  useEffect(() => {
    if (!open) return
    let map: import('leaflet').Map | undefined
    let cancelled = false

    ;(async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !containerRef.current) return

        map = L.map(containerRef.current, { scrollWheelZoom: true, attributionControl: true })
        mapRef.current = map
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        for (const c of clusters) {
          const n = c.items.length
          const size = n > 9 ? 50 : n > 1 ? 44 : 36
          const icon = L.divIcon({
            className: '',
            html: `<span style="
              display:flex;align-items:center;justify-content:center;
              width:${size}px;height:${size}px;border-radius:9999px;
              background:${MARKER_RED};color:#fff;border:3px solid #fff;
              box-shadow:0 0 0 4px ${MARKER_RED_HALO}, 0 2px 10px rgba(0,0,0,.45);
              font:800 ${n > 9 ? 15 : 14}px system-ui,sans-serif;">${n}</span>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })
          L.marker([c.latitude, c.longitude], {
            icon,
            title: c.placeName ? `${c.placeName} — ${n} post${n > 1 ? 's' : ''}` : `${n} post${n > 1 ? 's' : ''}`,
          })
            .addTo(map)
            .on('click', () => setSelected(c))
        }

        // Sample dots: outlined and translucent so they read as illustrative,
        // never as real activity. A popup says so explicitly on tap.
        for (const m of samples) {
          const icon = L.divIcon({
            className: '',
            html: `<span style="
              display:flex;align-items:center;justify-content:center;
              width:32px;height:32px;border-radius:9999px;
              background:#fff;color:${MARKER_RED};
              border:2.5px dashed ${MARKER_RED};
              box-shadow:0 1px 6px rgba(0,0,0,.28);
              font:700 12px system-ui,sans-serif;">${m.count}</span>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
          L.marker([m.latitude, m.longitude], {
            icon,
            title: `${m.stateName} — sample data`,
            zIndexOffset: -500,
          })
            .addTo(map)
            .bindPopup(
              `<strong>${m.stateName}</strong><br/>${m.city}<br/>` +
              `<span style="color:#666">Sample marker — ${m.count} illustrative posts, not real activity.</span>`
            )
        }

        // Fit to real activity when there is any, otherwise show all of India.
        const fitPoints = clusters.length
          ? clusters.map(c => [c.latitude, c.longitude] as [number, number])
          : null
        if (fitPoints) {
          map.fitBounds(fitPoints, { padding: [48, 48], maxZoom: 11 })
        } else {
          map.fitBounds(INDIA_BOUNDS)
        }

        setTimeout(() => map?.invalidateSize(), 250)
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  }, [open, signature, clusters, samples])

  // Opening the post list shrinks the map container, which Leaflet cannot
  // detect on its own — without this the tapped marker ends up behind the list.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const id = setTimeout(() => {
      map.invalidateSize()
      if (selected) map.panTo([selected.latitude, selected.longitude], { animate: true })
    }, 260)
    return () => clearTimeout(id)
  }, [selected])

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
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3 border-b shrink-0">
              <MapTrifold size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
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

            {/* Map */}
            <div className="relative flex-1 min-h-0 bg-muted">
              <div ref={containerRef} className="w-full h-full" />
              {status === 'loading' && (
                <p className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-muted-foreground pointer-events-none">
                  <Spinner size={14} className="animate-spin" /> Loading map…
                </p>
              )}
              {status === 'error' && (
                <p className="absolute inset-0 flex items-center justify-center gap-2 px-6 text-center text-xs text-muted-foreground">
                  <WarningCircle size={14} /> The map could not be loaded.
                </p>
              )}
              {status === 'ready' && (
                <div className="absolute bottom-2 left-2 z-[400] rounded-lg border bg-card/95 backdrop-blur-sm px-2.5 py-2 text-[11px] space-y-1 pointer-events-none">
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
              )}
              {status === 'ready' && clusters.length === 0 && (
                <div className="absolute inset-x-4 top-4 rounded-xl border bg-card/95 backdrop-blur-sm p-3 text-xs text-muted-foreground">
                  No mission posts carry a location yet. Add an update with a photo — the camera
                  attaches your position, and photos from a phone bring their own GPS.
                </div>
              )}
            </div>

            {/* Posts at the tapped marker */}
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
                              <img
                                src={photo.media.url}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">
                                {pin.update.note ?? 'Field update'}
                              </p>
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
