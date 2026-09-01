'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Modal for logging a mission field update with a photo.
 *
 * Photo capture is two plain file inputs — one with capture="environment" so
 * phones open the rear camera — so this needs no native app on any platform.
 */
export function MissionUpdateDialog({ open, onClose }: Props) {
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

  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current) }, [])

  /** Dismiss without posting — the draft and its object URL are thrown away. */
  const close = useCallback(() => {
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null }
    setFile(null); setPreviewUrl(null); setMeta(null)
    setNote(''); setTopicId('')
    setReading(false); setGeocoding(false); setLocating(false); setSaving(false)
    onClose()
  }, [onClose])

  // Escape to dismiss, and don't let the page scroll behind the panel.
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
    setMeta(prev => ({ ...(prev ?? {}), latitude: pos.latitude, longitude: pos.longitude, locationSource: 'device' }))
    setGeocoding(true)
    const place = await reverseGeocode(pos.latitude, pos.longitude)
    setGeocoding(false)
    setLocating(false)
    if (place) setMeta(prev => (prev ? { ...prev, placeName: place } : prev))
  }

  function clearPhoto() {
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null }
    setFile(null); setPreviewUrl(null); setMeta(null)
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
    // Hand the object URL to the posted card rather than revoking it.
    objectUrl.current = null
    setFile(null); setPreviewUrl(null); setMeta(null); setNote(''); setTopicId('')
    setSaving(false)
    onClose()
  }

  const hasCoords = meta?.latitude !== undefined && meta?.longitude !== undefined
  const noExifDate = Boolean(meta && !meta.capturedAt)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            key="mu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="New mission update"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border flex flex-col max-h-[90dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button
                onClick={close}
                aria-label="Close"
                className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-sm font-semibold text-foreground">New mission update</h2>
              <button
                onClick={handlePost}
                disabled={!canPost}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 disabled:hover:bg-primary transition-colors"
              >
                {saving && <Spinner size={14} className="animate-spin" />}
                Post
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-4 py-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
              <div className="flex gap-3">
                <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'You'} size="sm" className="hidden sm:inline-flex" />

                <div className="flex-1 min-w-0">
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    autoFocus
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

                  {previewUrl && (
                    <div className="mt-2 rounded-xl border overflow-hidden">
                      <div className="relative">
                        <img src={previewUrl} alt={file?.name ?? 'Selected photo'} className="w-full max-h-64 object-cover" />
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

                  {mission && mission.topics.length > 0 && (
                    <div className="mt-3">
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
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
