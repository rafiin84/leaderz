'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Spinner, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { groupByState, INDIA_BOUNDS, type LocationCluster } from '@/lib/clusterLocations'
import { SAMPLE_STATE_MARKERS } from '@/data/mock/missionMapSamples'
import type { MissionUpdate } from '@/types/mission'
import 'leaflet/dist/leaflet.css'

/** Markers are red so they stand out against OSM's green/beige tiles. */
export const MARKER_RED = '#dc2626'
const MARKER_RED_HALO = 'rgba(220,38,38,0.25)'

/** One post pinned at one of its photos' coordinates. A post with photos in
 *  two places legitimately appears at both. */
export interface Pin {
  update: MissionUpdate
  photoIndex: number
  latitude: number
  longitude: number
  placeName?: string
  stateName?: string
}

interface Props {
  updates: MissionUpdate[]
  showSamples?: boolean
  /** Fired when a real activity marker is tapped. */
  onSelectCluster?: (cluster: LocationCluster<Pin>) => void
  /** Re-fits and re-measures when this changes — used when a panel opens. */
  resizeKey?: string | number
  /** Pans to this cluster when set. */
  focus?: LocationCluster<Pin> | null
  className?: string
  interactive?: boolean
}

/** Derives the map's pins, state clusters and sample markers from updates. */
export function useMissionMapData(updates: MissionUpdate[], showSamples: boolean) {
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

  const pinnedPostCount = useMemo(() => new Set(pins.map(p => p.update.id)).size, [pins])

  return { pins, clusters, samples, pinnedPostCount }
}

/**
 * The mission map canvas, shared by the embedded map on the Mission page and
 * the expanded dialog.
 *
 * Leaflet with OpenStreetMap **raster** tiles: OSM's own embed switched to a
 * WebGL renderer and fails wherever WebGL is unavailable, whereas raster tiles
 * are plain <img> requests. Leaflet is imported dynamically because it touches
 * `window` on load.
 */
export function MissionMap({
  updates,
  showSamples = true,
  onSelectCluster,
  resizeKey,
  focus,
  className,
  interactive = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const { clusters, samples } = useMissionMapData(updates, showSamples)

  const signature = useMemo(
    () =>
      clusters.map(c => `${c.latitude.toFixed(4)},${c.longitude.toFixed(4)}:${c.items.length}`).join('|') +
      '#' + samples.map(m => m.stateName).join(','),
    [clusters, samples]
  )

  useEffect(() => {
    let map: import('leaflet').Map | undefined
    let cancelled = false

    ;(async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !containerRef.current) return

        map = L.map(containerRef.current, {
          scrollWheelZoom: interactive,
          dragging: interactive,
          zoomControl: interactive,
          attributionControl: true,
        })
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
            .on('click', () => onSelectCluster?.(c))
        }

        // Sample dots: outlined so they read as illustrative, never as real
        // activity. A popup says so explicitly on tap.
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

        if (clusters.length) {
          map.fitBounds(clusters.map(c => [c.latitude, c.longitude] as [number, number]), {
            padding: [48, 48],
            maxZoom: 11,
          })
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
  }, [signature, clusters, samples, onSelectCluster, interactive])

  // The container can be resized by a panel opening, which Leaflet cannot
  // detect on its own.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const id = setTimeout(() => {
      map.invalidateSize()
      if (focus) map.panTo([focus.latitude, focus.longitude], { animate: true })
    }, 260)
    return () => clearTimeout(id)
  }, [resizeKey, focus])

  return (
    // `isolate` keeps Leaflet's internal z-indexes (panes 400, controls 800)
    // inside their own stacking context, so they cannot paint over dialogs.
    <div className={cn('isolate', className)}>
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
    </div>
  )
}
