import type { PhotoMetadata } from '@/types/mission'

/**
 * Reads EXIF out of a user-selected photo, entirely in the browser.
 *
 * exifr is imported dynamically so its parser never lands in the initial
 * bundle — it is only needed once someone actually picks a file.
 *
 * Nothing here is guaranteed: photos shared through messaging apps, and
 * screenshots, usually have EXIF stripped. Every field is optional and the
 * caller must render around whatever is missing.
 */

function toIso(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString()
  if (typeof value === 'string') {
    // EXIF dates look like "2026:08:31 14:22:05" — not parseable as-is.
    const normalised = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
    const d = new Date(normalised)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }
  return undefined
}

function formatExposure(seconds: unknown): string | undefined {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return undefined
  return seconds >= 1 ? `${seconds.toFixed(1)}s` : `1/${Math.round(1 / seconds)}s`
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function str(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const t = value.trim()
  return t.length ? t : undefined
}

export async function readPhotoMetadata(file: File): Promise<PhotoMetadata> {
  const base: PhotoMetadata = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || undefined,
    fileModifiedAt: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
  }

  let exif: Record<string, unknown> | undefined
  try {
    const { default: exifr } = await import('exifr')
    // No `pick` here: it filters on raw tag names, so listing 'latitude' /
    // 'longitude' excludes the underlying GPSLatitude/GPSLatitudeRef tags and
    // exifr then never derives the decimal coordinates at all.
    exif = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
    }) as Record<string, unknown> | undefined
  } catch {
    // Unsupported container, stripped EXIF, or a corrupt header — fall through
    // with just the file-level facts.
    exif = undefined
  }

  if (!exif) return withPixelFallback(base, file)

  const meta: PhotoMetadata = {
    ...base,
    capturedAt: toIso(exif.DateTimeOriginal) ?? toIso(exif.CreateDate) ?? toIso(exif.ModifyDate),
    latitude: num(exif.latitude),
    longitude: num(exif.longitude),
    altitude: num(exif.GPSAltitude),
    locationSource: num(exif.latitude) !== undefined ? 'exif' : undefined,
    cameraMake: str(exif.Make),
    cameraModel: str(exif.Model),
    lensModel: str(exif.LensModel),
    orientation: num(exif.Orientation),
    width: num(exif.ExifImageWidth) ?? num(exif.ImageWidth),
    height: num(exif.ExifImageHeight) ?? num(exif.ImageHeight),
    exposureTime: formatExposure(exif.ExposureTime),
    fNumber: num(exif.FNumber) !== undefined ? `f/${num(exif.FNumber)!.toFixed(1)}` : undefined,
    iso: num(exif.ISO),
    focalLength: num(exif.FocalLength) !== undefined ? `${Math.round(num(exif.FocalLength)!)}mm` : undefined,
  }

  return withPixelFallback(meta, file)
}

/** If EXIF had no dimensions, measure the decoded image instead. */
async function withPixelFallback(meta: PhotoMetadata, file: File): Promise<PhotoMetadata> {
  if (meta.width && meta.height) return meta
  try {
    const url = URL.createObjectURL(file)
    const dims = await new Promise<{ w: number; h: number } | null>(resolve => {
      const img = new window.Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => resolve(null)
      img.src = url
    })
    URL.revokeObjectURL(url)
    if (dims) return { ...meta, width: dims.w, height: dims.h }
  } catch {
    /* dimensions are cosmetic — never block the upload on them */
  }
  return meta
}

/**
 * Turns coordinates into a human place name via OpenStreetMap's Nominatim.
 *
 * Deliberately best-effort: it is a public, rate-limited service with no key,
 * so a failure (offline, throttled, blocked) returns undefined and the UI falls
 * back to showing the raw coordinates.
 */
export interface GeocodeResult {
  /** Human-readable "locality, district, state" label. */
  placeName?: string
  /** State on its own, so posts can be grouped by state on the map. */
  stateName?: string
}

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<GeocodeResult | undefined> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return undefined
    const json = await res.json()
    const a = json.address ?? {}
    const parts = [
      a.village ?? a.town ?? a.suburb ?? a.city ?? a.hamlet,
      a.county ?? a.state_district,
      a.state,
    ].filter(Boolean)
    return {
      placeName: parts.length ? [...new Set(parts)].join(', ') : (json.display_name as string | undefined),
      stateName: (a.state as string | undefined) ?? undefined,
    }
  } catch {
    return undefined
  }
}

/** Current device position, for photos whose EXIF carries no GPS. */
export function getDeviceLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(undefined)
    navigator.geolocation.getCurrentPosition(
      p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(undefined),
      // maximumAge: 0 — never accept a cached fix. This position is stamped on
      // a photo as "where it was taken", and a fix even a minute old can be a
      // different place entirely for anyone moving between updates.
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    )
  })
}

export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(5)}° ${ns}, ${Math.abs(lon).toFixed(5)}° ${ew}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
