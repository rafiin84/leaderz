/**
 * Groups geotagged items into location clusters for the mission map.
 *
 * Greedy single-pass clustering on great-circle distance: each point joins the
 * first cluster whose centre is within `radiusKm`, otherwise starts its own.
 * That is deterministic, needs no dependency, and is more than adequate for the
 * handful of markers a mission accumulates. It is not k-means — clusters depend
 * on input order — which is fine because we only ever need "posts near here".
 */

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface LocationCluster<T> {
  id: string
  /** Mean position of the members, used as the marker position. */
  latitude: number
  longitude: number
  /** Most common place name among members, for the marker label. */
  placeName?: string
  items: T[]
}

const EARTH_KM = 6371

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Shortens a reverse-geocoded name to its most recognisable part.
 *  "Kizhapuliyur, Tenkasi, Tamil Nadu" -> "Tenkasi, Tamil Nadu" */
export function shortPlaceName(full?: string): string | undefined {
  if (!full) return undefined
  const parts = full.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length <= 2) return parts.join(', ')
  return parts.slice(-2).join(', ')
}

export function clusterByLocation<T>(
  items: T[],
  getPoint: (item: T) => GeoPoint | undefined,
  getPlaceName: (item: T) => string | undefined,
  radiusKm = 25
): LocationCluster<T>[] {
  const clusters: (LocationCluster<T> & { _names: string[] })[] = []

  for (const item of items) {
    const point = getPoint(item)
    if (!point) continue

    const hit = clusters.find(c => distanceKm(c, point) <= radiusKm)
    if (hit) {
      hit.items.push(item)
      const name = getPlaceName(item)
      if (name) hit._names.push(name)
      // Recentre on the running mean so a cluster tracks its members.
      const n = hit.items.length
      hit.latitude += (point.latitude - hit.latitude) / n
      hit.longitude += (point.longitude - hit.longitude) / n
    } else {
      const name = getPlaceName(item)
      clusters.push({
        id: `cluster-${clusters.length}`,
        latitude: point.latitude,
        longitude: point.longitude,
        items: [item],
        _names: name ? [name] : [],
      })
    }
  }

  return clusters.map(({ _names, ...c }) => ({
    ...c,
    placeName: shortPlaceName(mostCommon(_names)),
  }))
}

function mostCommon(values: string[]): string | undefined {
  if (!values.length) return undefined
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

/** Rough mainland-India bounding box, used when there is nothing to fit to. */
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.5, 68.0],
  [35.7, 97.5],
]
