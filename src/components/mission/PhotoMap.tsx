'use client'
import { useEffect, useRef, useState } from 'react'
import { Spinner, WarningCircle } from '@phosphor-icons/react'
import 'leaflet/dist/leaflet.css'

interface Props {
  latitude: number
  longitude: number
  /** Tooltip on the marker — usually the resolved place name. */
  label?: string
  className?: string
}

/**
 * Interactive map pinned to a photo's coordinates.
 *
 * Leaflet with OpenStreetMap **raster** tiles, deliberately: OSM's own embed
 * iframe switched to a WebGL renderer and shows "your browser does not support
 * WebGL" wherever WebGL is unavailable. Raster tiles are plain <img> requests,
 * so the map works on any browser and inside headless/soft-rendered contexts.
 *
 * Leaflet is imported dynamically because it touches `window` on load, which
 * would break server rendering.
 */
export function PhotoMap({ latitude, longitude, label, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let map: import('leaflet').Map | undefined
    let cancelled = false

    ;(async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !containerRef.current) return

        map = L.map(containerRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          scrollWheelZoom: true,
          attributionControl: true,
        })

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        // A CSS-drawn marker avoids Leaflet's default icon assets, whose
        // relative image paths break under bundlers.
        const icon = L.divIcon({
          className: '',
          html: `<span style="
            display:block;width:22px;height:22px;border-radius:9999px;
            background:#dc2626;border:3px solid #fff;
            box-shadow:0 0 0 4px rgba(220,38,38,0.25), 0 2px 8px rgba(0,0,0,.45);"></span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })
        const marker = L.marker([latitude, longitude], { icon, title: label }).addTo(map)
        if (label) marker.bindPopup(label)

        // The container is sized by its parent, which may still be animating
        // the dialog in; recalculate once it has settled.
        setTimeout(() => map?.invalidateSize(), 250)
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      map?.remove()
    }
  }, [latitude, longitude, label])

  return (
    <div className={className}>
      <div ref={containerRef} className="w-full h-full" style={{ background: 'var(--muted)' }} />
      {status === 'loading' && (
        <p className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-muted-foreground pointer-events-none">
          <Spinner size={14} className="animate-spin" /> Loading map…
        </p>
      )}
      {status === 'error' && (
        <p className="absolute inset-0 flex items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">
          <WarningCircle size={14} /> The map could not be loaded. The coordinates below still apply.
        </p>
      )}
    </div>
  )
}
