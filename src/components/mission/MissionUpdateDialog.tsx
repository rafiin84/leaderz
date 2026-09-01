'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Image as ImageIcon, X, Spinner, Crosshair, WarningCircle,
  ArrowsClockwise, Circle, MapPin,
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useLeader, useMission, useAddMissionUpdate } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/lib/utils'
import {
  readPhotoMetadata, reverseGeocode, getDeviceLocation, formatCoords,
} from '@/lib/photoMetadata'
import type { MissionUpdate, MissionPhoto, PhotoMetadata } from '@/types/mission'

let seq = 0
const nextId = () => `mu-${Date.now()}-${seq++}`

/** Cap so a single update stays reviewable, and so we don't hold an unbounded
 *  number of object URLs alive. */
export const MAX_PHOTOS = 8

interface Props {
  open: boolean
  onClose: () => void
}

/** One pending attachment in the composer, with its own metadata read. */
interface Draft {
  id: string
  file: File
  url: string
  meta: PhotoMetadata | null
  reading: boolean
}

/**
 * Modal for logging a mission field update with one or more photos.
 *
 * Photos can be picked from disk (multi-select) or shot with the in-page
 * camera, which appends rather than replaces so several can be taken in a row.
 * Each photo carries its own metadata — location and capture time differ shot
 * to shot.
 */
export function MissionUpdateDialog({ open, onClose }: Props) {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: leader } = useLeader(activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const addUpdate = useAddMissionUpdate(activeTenantId)

  const [note, setNote] = useState('')
  const [topicId, setTopicId] = useState('')
  const [photos, setPhotos] = useState<Draft[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [geocodingIds, setGeocodingIds] = useState<string[]>([])
  const [locatingIds, setLocatingIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [limitHit, setLimitHit] = useState(false)

  // Live webcam capture. The `capture` attribute on a file input is honoured
  // only by mobile browsers — desktop ignores it and shows a file picker — so
  // opening a laptop camera needs getUserMedia and a canvas snapshot.
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [cameraLabel, setCameraLabel] = useState<string | undefined>()
  const [deviceIds, setDeviceIds] = useState<string[]>([])
  const [deviceIndex, setDeviceIndex] = useState(0)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'ready' | 'unavailable'>('idle')
  const pendingPosition = useRef<Promise<{ latitude: number; longitude: number } | undefined> | null>(null)

  const libraryRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  /** Every object URL handed out, so none leak if the draft is abandoned. */
  const urls = useRef<string[]>([])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => () => {
    urls.current.forEach(URL.revokeObjectURL)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  /** Dismiss without posting — drafts and their object URLs are thrown away. */
  const close = useCallback(() => {
    stopStream()
    setCameraOpen(false); setCameraError(null); setCameraStarting(false)
    urls.current.forEach(URL.revokeObjectURL)
    urls.current = []
    setPhotos([]); setActiveId(null)
    setNote(''); setTopicId('')
    setGeocodingIds([]); setLocatingIds([]); setSaving(false); setLimitHit(false)
    pendingPosition.current = null
    setGeoStatus('idle')
    onClose()
  }, [onClose, stopStream])

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

  const patch = (id: string, next: Partial<Draft>) =>
    setPhotos(prev => prev.map(p => (p.id === id ? { ...p, ...next } : p)))

  const patchMeta = (id: string, next: Partial<PhotoMetadata>) =>
    setPhotos(prev => prev.map(p => (p.id === id ? { ...p, meta: { ...(p.meta ?? {}), ...next } } : p)))

  /** Reverse-geocodes a position onto one draft, keeping the state separately
   *  so the mission map can group posts by state. */
  async function applyPlaceName(id: string, lat: number, lon: number) {
    setGeocodingIds(prev => [...prev, id])
    const geo = await reverseGeocode(lat, lon)
    setGeocodingIds(prev => prev.filter(x => x !== id))
    if (geo?.placeName || geo?.stateName) {
      patchMeta(id, { placeName: geo.placeName, stateName: geo.stateName })
    }
  }

  /** Adds files as drafts, then reads each one's metadata independently. */
  async function addFiles(files: File[]) {
    const images = files.filter(f => f.type.startsWith('image/'))
    if (!images.length) return

    // Built before the state update: React may invoke an updater twice in
    // development, which would create two object URLs per file.
    const room = MAX_PHOTOS - photos.length
    if (room <= 0) { setLimitHit(true); return }
    setLimitHit(images.length > room)
    const accepted: Draft[] = images.slice(0, room).map(file => {
      const url = URL.createObjectURL(file)
      urls.current.push(url)
      return { id: nextId(), file, url, meta: null, reading: true }
    })
    setPhotos(prev => [...prev, ...accepted])

    // Read outside the state updater so React isn't holding the queue.
    await Promise.all(accepted.map(async d => {
      const m = await readPhotoMetadata(d.file)
      patch(d.id, { meta: m, reading: false })
      setActiveId(d.id)
      if (m.latitude !== undefined && m.longitude !== undefined) {
        await applyPlaceName(d.id, m.latitude, m.longitude)
      }
    }))
  }

  async function attachDeviceLocation(id: string) {
    setLocatingIds(prev => [...prev, id])
    const pos = await getDeviceLocation()
    setLocatingIds(prev => prev.filter(x => x !== id))
    if (!pos) return
    patchMeta(id, { latitude: pos.latitude, longitude: pos.longitude, locationSource: 'device' })
    await applyPlaceName(id, pos.latitude, pos.longitude)
  }

  function removePhoto(id: string) {
    const gone = photos.find(p => p.id === id)
    if (gone) {
      URL.revokeObjectURL(gone.url)
      urls.current = urls.current.filter(u => u !== gone.url)
    }
    const next = photos.filter(p => p.id !== id)
    setPhotos(next)
    if (activeId === id) setActiveId(next.at(-1)?.id ?? null)
    setLimitHit(false)
  }

  async function openCamera(id?: string) {
    setCameraError(null)
    setCameraStarting(true)
    setCameraOpen(true)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraStarting(false)
      setCameraError(
        window.isSecureContext === false
          ? 'Camera access needs a secure connection (https). Use “Choose photos” instead.'
          : 'This browser does not support in-page camera capture. Use “Choose photos” instead.'
      )
      return
    }
    try {
      stopStream()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: id
          ? { deviceId: { exact: id } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      // A canvas snapshot cannot carry EXIF GPS, so take the device's position
      // now — for an in-page capture that *is* where the photo is being taken.
      if (!pendingPosition.current) {
        setGeoStatus('locating')
        pendingPosition.current = getDeviceLocation()
        pendingPosition.current.then(p => setGeoStatus(p ? 'ready' : 'unavailable'))
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCameraLabel(stream.getVideoTracks()[0]?.label || undefined)
      const cams = (await navigator.mediaDevices.enumerateDevices())
        .filter(d => d.kind === 'videoinput')
        .map(d => d.deviceId)
        .filter(Boolean)
      setDeviceIds(cams)
      setCameraStarting(false)
    } catch (e) {
      setCameraStarting(false)
      const name = (e as DOMException)?.name
      setCameraError(
        name === 'NotAllowedError' ? 'Camera permission was denied. Allow it in your browser’s site settings, or use “Choose photos”.'
        : name === 'NotFoundError' ? 'No camera was found on this device. Use “Choose photos” instead.'
        : name === 'NotReadableError' ? 'The camera is already in use by another app.'
        : 'Could not start the camera. Use “Choose photos” instead.'
      )
    }
  }

  function closeCamera() {
    stopStream()
    setCameraOpen(false)
    setCameraError(null)
    setCameraStarting(false)
    pendingPosition.current = null
    setGeoStatus('idle')
  }

  async function switchCamera() {
    if (deviceIds.length < 2) return
    const next = (deviceIndex + 1) % deviceIds.length
    setDeviceIndex(next)
    await openCamera(deviceIds[next])
  }

  /** Snapshot the live video into a JPEG and append it. The camera stays open
   *  so several shots can be taken in a row. */
  async function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    if (photos.length >= MAX_PHOTOS) { setLimitHit(true); return }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.92))
    if (!blob) return

    const shotAt = new Date()
    const captured = new File([blob], `camera-${shotAt.toISOString().replace(/[:.]/g, '-')}.jpg`, {
      type: 'image/jpeg',
      lastModified: shotAt.getTime(),
    })
    const url = URL.createObjectURL(captured)
    urls.current.push(url)
    const draft: Draft = { id: nextId(), file: captured, url, meta: null, reading: false }
    setPhotos(prev => [...prev, draft])
    setActiveId(draft.id)

    const pos = await (pendingPosition.current ?? getDeviceLocation())
    // Drop the warmed-up fix so the next shot re-reads the position; the
    // browser's own maximumAge cache keeps that cheap.
    pendingPosition.current = null
    patch(draft.id, {
      meta: {
        fileName: captured.name,
        fileSize: captured.size,
        mimeType: captured.type,
        capturedAt: shotAt.toISOString(),
        cameraModel: cameraLabel,
        width: canvas.width,
        height: canvas.height,
        ...(pos ? { latitude: pos.latitude, longitude: pos.longitude, locationSource: 'device' as const } : {}),
      },
    })
    if (pos) await applyPlaceName(draft.id, pos.latitude, pos.longitude)
  }

  const canPost = (photos.length > 0 || note.trim().length > 0) && !saving && !photos.some(p => p.reading)

  async function handlePost() {
    if (!canPost || !mission) return
    setSaving(true)
    const topic = mission.topics.find(t => t.id === topicId)
    const now = new Date().toISOString()
    const attached: MissionPhoto[] = photos.map(p => ({
      media: {
        id: p.id,
        type: 'image',
        url: p.url,
        caption: p.file.name,
        width: p.meta?.width,
        height: p.meta?.height,
      },
      metadata: p.meta ?? undefined,
    }))
    const update: MissionUpdate = {
      id: nextId(),
      tenantId: activeTenantId,
      missionId: mission.id,
      authorName: leader?.name ?? 'You',
      authorAvatar: leader?.avatarUrl,
      note: note.trim() || undefined,
      topicId: topic?.id,
      topicName: topic?.name,
      photos: attached,
      createdAt: now,
      updatedAt: now,
    }
    await new Promise(r => setTimeout(r, 400))
    addUpdate(update)
    // Object URLs are handed to the posted card, so don't revoke them here.
    urls.current = []
    setPhotos([]); setActiveId(null); setNote(''); setTopicId(''); setLimitHit(false)
    setSaving(false)
    pendingPosition.current = null
    setGeoStatus('idle')
    onClose()
  }

  const active = photos.find(p => p.id === activeId) ?? null
  const atLimit = photos.length >= MAX_PHOTOS

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
              <h2 className="text-sm font-semibold text-foreground">
                New mission update
                {photos.length > 0 && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    {photos.length}/{MAX_PHOTOS}
                  </span>
                )}
              </h2>
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
            <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
              <div className="flex gap-3">
                <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'You'} size="sm" className="hidden sm:inline-flex" />

                <div className="flex-1 min-w-0">
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Add a note about this mission update…"
                    aria-label="Mission update note"
                    className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />

                  <input
                    ref={libraryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }}
                  />

                  {/* Live camera — stays open so several shots can be taken */}
                  {cameraOpen && (
                    <div className="mt-2 rounded-xl border overflow-hidden bg-black">
                      <div className="relative">
                        <video ref={videoRef} playsInline muted autoPlay className="w-full max-h-56 object-cover bg-black" />
                        {cameraStarting && (
                          <p className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-white">
                            <Spinner size={14} className="animate-spin" /> Starting camera…
                          </p>
                        )}
                        <button
                          onClick={closeCamera}
                          aria-label="Close camera"
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>

                      {cameraError ? (
                        <p className="p-3 text-xs text-destructive bg-card">{cameraError}</p>
                      ) : (
                        <div className="flex items-center justify-center gap-3 p-3 bg-card">
                          {deviceIds.length > 1 && (
                            <button
                              onClick={switchCamera}
                              aria-label="Switch camera"
                              className="p-2 rounded-full border text-foreground/70 hover:bg-muted transition-colors"
                            >
                              <ArrowsClockwise size={16} />
                            </button>
                          )}
                          <button
                            onClick={capturePhoto}
                            disabled={cameraStarting || atLimit}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                          >
                            <Circle size={14} weight="fill" />
                            {atLimit ? `Limit ${MAX_PHOTOS} reached` : 'Capture'}
                          </button>
                        </div>
                      )}
                      {!cameraError && (
                        <div className="px-3 pb-3 -mt-1 bg-card">
                          {cameraLabel && (
                            <p className="text-[11px] text-muted-foreground text-center truncate">{cameraLabel}</p>
                          )}
                          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[11px] text-center text-muted-foreground">
                            {geoStatus === 'locating' && <><Spinner size={11} className="animate-spin" /> Getting your location…</>}
                            {geoStatus === 'ready' && <><Crosshair size={11} /> Location will be attached from this device</>}
                            {geoStatus === 'unavailable' && <><WarningCircle size={11} /> Location unavailable — photos will have no coordinates</>}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnail grid — tap one to inspect its metadata */}
                  {photos.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {photos.map(p => {
                        const hasCoords = p.meta?.latitude !== undefined
                        return (
                          <div key={p.id} className="relative">
                            <button
                              onClick={() => setActiveId(p.id)}
                              aria-label={`Show details for ${p.file.name}`}
                              aria-pressed={p.id === activeId}
                              className={cn(
                                'block w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                                p.id === activeId ? 'border-primary' : 'border-transparent hover:border-border'
                              )}
                            >
                              <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
                            </button>
                            {p.reading ? (
                              <span className="absolute bottom-1 left-1 p-1 rounded-full bg-black/60 text-white">
                                <Spinner size={9} className="animate-spin" />
                              </span>
                            ) : (
                              <span
                                title={hasCoords ? 'Has location' : 'No location'}
                                className={cn(
                                  'absolute bottom-1 left-1 p-1 rounded-full',
                                  hasCoords ? 'bg-primary text-primary-foreground' : 'bg-black/50 text-white/70'
                                )}
                              >
                                {hasCoords ? <MapPin size={9} weight="fill" /> : <WarningCircle size={9} />}
                              </span>
                            )}
                            <button
                              onClick={() => removePhoto(p.id)}
                              aria-label={`Remove ${p.file.name}`}
                              className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                            >
                              <X size={11} weight="bold" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {limitHit && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Up to {MAX_PHOTOS} photos per update — extra selections were skipped.
                    </p>
                  )}

                  {/* Metadata for the selected photo */}
                  {active && (
                    <div className="mt-2 p-3 rounded-xl border bg-muted/30">
                      <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-2 truncate">
                        {active.file.name}
                      </p>
                      {active.reading ? (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Spinner size={13} className="animate-spin" /> Reading photo metadata…
                        </p>
                      ) : (
                        <>
                          <PhotoMetadataList meta={active.meta} geocoding={geocodingIds.includes(active.id)} />
                          {active.meta?.latitude === undefined && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <WarningCircle size={13} />
                                No GPS in this photo
                              </p>
                              <button
                                onClick={() => attachDeviceLocation(active.id)}
                                disabled={locatingIds.includes(active.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border hover:bg-muted transition-colors disabled:opacity-50"
                              >
                                {locatingIds.includes(active.id)
                                  ? <Spinner size={12} className="animate-spin" />
                                  : <Crosshair size={12} />}
                                Use my current location
                              </button>
                            </div>
                          )}
                        </>
                      )}
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

                </div>
              </div>
            </div>

            {/* Photo actions live outside the scroll area so they are always
                reachable — on iOS the on-screen keyboard overlays the bottom of
                a fixed sheet rather than resizing it, which buried them. */}
            <div className="shrink-0 border-t px-4 py-3 flex flex-wrap items-center gap-2 bg-card rounded-b-none md:rounded-b-2xl"
                 style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => openCamera()}
                disabled={atLimit}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border hover:bg-muted transition-colors disabled:opacity-40"
              >
                <Camera size={17} />
                Take photo
              </button>
              <button
                onClick={() => libraryRef.current?.click()}
                disabled={atLimit}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ImageIcon size={17} />
                Choose photos
              </button>
              {atLimit && (
                <span className="text-[11px] text-muted-foreground ml-auto">Max {MAX_PHOTOS}</span>
              )}
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
