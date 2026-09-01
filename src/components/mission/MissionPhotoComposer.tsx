'use client'
import { useRef, useState, useEffect } from 'react'
import {
  Camera, Image as ImageIcon, X, Spinner, Crosshair, WarningCircle,
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useLeader, useMission, useAddMissionUpdate } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import {
  readPhotoMetadata, reverseGeocode, getDeviceLocation, formatCoords,
} from '@/lib/photoMetadata'
import type { MissionUpdate, PhotoMetadata } from '@/types/mission'

let seq = 0
const nextId = () => `mu-${Date.now()}-${seq++}`

export function MissionPhotoComposer() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: leader } = useLeader(activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const addUpdate = useAddMissionUpdate(activeTenantId)

  const [note, setNote] = useState('')
  const [topicId, setTopicId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [meta, setMeta] = useState<PhotoMetadata | null>(null)
  const [reading, setReading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [locating, setLocating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [posted, setPosted] = useState(false)

  // Two inputs: `capture` opens the camera on phones, the other is a library
  // or filesystem picker. Both are plain file inputs, so this works in any
  // browser with no native app involved.
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current) }, [])

  async function onPick(picked: File | undefined) {
    if (!picked) return
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    const url = URL.createObjectURL(picked)
    objectUrl.current = url
    setFile(picked)
    setPreviewUrl(url)
    setReading(true)
    setMeta(null)

    const m = await readPhotoMetadata(picked)
    setMeta(m)
    setReading(false)

    // Resolve a place name if the photo carried coordinates.
    if (m.latitude !== undefined && m.longitude !== undefined) {
      setGeocoding(true)
      const place = await reverseGeocode(m.latitude, m.longitude)
      setGeocoding(false)
      if (place) setMeta(prev => (prev ? { ...prev, placeName: place } : prev))
    }
  }

  async function useDeviceLocation() {
    setLocating(true)
    const pos = await getDeviceLocation()
    if (!pos) { setLocating(false); return }
    setMeta(prev => ({
      ...(prev ?? {}),
      latitude: pos.latitude,
      longitude: pos.longitude,
      locationSource: 'device',
    }))
    setGeocoding(true)
    const place = await reverseGeocode(pos.latitude, pos.longitude)
    setGeocoding(false)
    setLocating(false)
    if (place) setMeta(prev => (prev ? { ...prev, placeName: place } : prev))
  }

  function clearPhoto() {
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null }
    setFile(null)
    setPreviewUrl(null)
    setMeta(null)
  }

  function reset() {
    // The posted card keeps the object URL, so hand it over rather than revoke.
    objectUrl.current = null
    setFile(null)
    setPreviewUrl(null)
    setMeta(null)
    setNote('')
    setTopicId('')
  }

  const canPost = Boolean(previewUrl || note.trim()) && !saving && !reading

  async function handlePost() {
    if (!canPost || !mission) return
    setSaving(true)
    const topic = mission.topics.find(t => t.id === topicId)
    const now = new Date().toISOString()
    const update: MissionUpdate = {
      id: nextId(),
      tenantId: activeTenantId,
      missionId: mission.id,
      authorName: leader?.name ?? 'You',
      authorAvatar: leader?.avatarUrl,
      note: note.trim() || undefined,
      topicId: topic?.id,
      topicName: topic?.name,
      photo: previewUrl
        ? { id: nextId(), type: 'image', url: previewUrl, caption: file?.name, width: meta?.width, height: meta?.height }
        : undefined,
      metadata: meta ?? undefined,
      createdAt: now,
      updatedAt: now,
    }
    await new Promise(r => setTimeout(r, 400))
    addUpdate(update)
    setSaving(false)
    setPosted(true)
    reset()
    setTimeout(() => setPosted(false), 2200)
  }

  const hasCoords = meta?.latitude !== undefined && meta?.longitude !== undefined
  const noExifDate = Boolean(meta && !meta.capturedAt)

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex gap-3">
        <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'You'} size="sm" className="hidden sm:inline-flex" />

        <div className="flex-1 min-w-0">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Add a note about this mission update…"
            aria-label="Mission update note"
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />

          {/* Hidden inputs — `capture` asks phones for the rear camera. */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={e => { onPick(e.target.files?.[0]); e.target.value = '' }}
          />
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            hidden
            onChange={e => { onPick(e.target.files?.[0]); e.target.value = '' }}
          />

          {/* Photo + metadata */}
          {previewUrl && (
            <div className="mt-2 rounded-xl border overflow-hidden">
              <div className="relative">
                <img src={previewUrl} alt={file?.name ?? 'Selected photo'} className="w-full max-h-72 object-cover" />
                <button
                  onClick={clearPhoto}
                  aria-label="Remove photo"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>

              <div className="p-3 border-t bg-muted/30">
                {reading ? (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Spinner size={13} className="animate-spin" /> Reading photo metadata…
                  </p>
                ) : (
                  <>
                    <PhotoMetadataList meta={meta} geocoding={geocoding} />

                    {!hasCoords && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <WarningCircle size={13} />
                          No GPS in this photo
                        </p>
                        <button
                          onClick={useDeviceLocation}
                          disabled={locating}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          {locating ? <Spinner size={12} className="animate-spin" /> : <Crosshair size={12} />}
                          Use my current location
                        </button>
                      </div>
                    )}

                    {noExifDate && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        No capture date in EXIF — messaging apps and screenshots usually strip it.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Topic link */}
          {mission && mission.topics.length > 0 && (
            <div className="mt-2">
              <select
                value={topicId}
                onChange={e => setTopicId(e.target.value)}
                aria-label="Link to mission topic"
                className="text-xs font-medium bg-muted rounded-full px-3 py-1.5 outline-none max-w-full"
              >
                <option value="">No topic</option>
                {mission.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Actions — wrap on narrow screens */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border hover:bg-muted transition-colors"
            >
              <Camera size={17} />
              Take photo
            </button>
            <button
              onClick={() => libraryRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border hover:bg-muted transition-colors"
            >
              <ImageIcon size={17} />
              Choose photo
            </button>

            <div className="flex items-center gap-3 ml-auto">
              {posted && <span className="text-xs font-medium text-primary">Added</span>}
              <button
                onClick={handlePost}
                disabled={!canPost}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 disabled:hover:bg-primary transition-colors"
              >
                {saving && <Spinner size={14} className="animate-spin" />}
                Post update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Metadata rows, rendering only what the photo actually carried. */
export function PhotoMetadataList({ meta, geocoding }: { meta: PhotoMetadata | null; geocoding?: boolean }) {
  if (!meta) return null

  const hasCoords = meta.latitude !== undefined && meta.longitude !== undefined
  const camera = [meta.cameraMake, meta.cameraModel].filter(Boolean).join(' ')
  const shot = [meta.exposureTime, meta.fNumber, meta.iso ? `ISO ${meta.iso}` : null, meta.focalLength]
    .filter(Boolean).join(' · ')

  const rows: { icon: string; label: string; value: React.ReactNode }[] = []

  if (meta.placeName) rows.push({ icon: '📍', label: 'Place', value: meta.placeName })
  else if (hasCoords && geocoding) rows.push({ icon: '📍', label: 'Place', value: <span className="text-muted-foreground">Looking up…</span> })

  if (hasCoords) {
    rows.push({
      icon: '🌍',
      label: 'GPS',
      value: (
        <a
          href={`https://www.openstreetmap.org/?mlat=${meta.latitude}&mlon=${meta.longitude}#map=15/${meta.latitude}/${meta.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted hover:text-foreground"
        >
          {formatCoords(meta.latitude!, meta.longitude!)}
          {meta.locationSource === 'device' && <span className="text-muted-foreground"> (device)</span>}
          {meta.altitude !== undefined && <span className="text-muted-foreground"> · {Math.round(meta.altitude)}m</span>}
        </a>
      ),
    })
  }

  if (meta.capturedAt) {
    rows.push({
      icon: '📅',
      label: 'Captured',
      value: new Date(meta.capturedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    })
  } else if (meta.fileModifiedAt) {
    rows.push({
      icon: '🕒',
      label: 'File date',
      value: new Date(meta.fileModifiedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    })
  }

  if (camera) rows.push({ icon: '📷', label: 'Camera', value: camera })
  if (meta.lensModel) rows.push({ icon: '🔎', label: 'Lens', value: meta.lensModel })
  if (shot) rows.push({ icon: '⚙️', label: 'Settings', value: shot })
  if (meta.width && meta.height) rows.push({ icon: '🖼️', label: 'Size', value: `${meta.width} × ${meta.height}` })

  if (!rows.length) {
    return (
      <p className="text-xs text-muted-foreground">
        This photo carries no readable EXIF metadata.
      </p>
    )
  }

  return (
    <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
      {rows.map(r => (
        <div key={r.label} className="flex gap-1.5 min-w-0">
          <span aria-hidden className="shrink-0">{r.icon}</span>
          <dt className="text-muted-foreground shrink-0">{r.label}</dt>
          <dd className="text-foreground truncate">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
