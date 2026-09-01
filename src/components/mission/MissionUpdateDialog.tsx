'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Image as ImageIcon, X, Spinner, Crosshair, WarningCircle,
  ArrowsClockwise, Circle,
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

  // Live webcam capture. The `capture` attribute on a file input is honoured
  // only by mobile browsers — desktop ignores it and shows a file picker — so
  // opening a laptop camera needs getUserMedia and a canvas snapshot.
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [cameraLabel, setCameraLabel] = useState<string | undefined>()
  const [deviceIds, setDeviceIds] = useState<string[]>([])
  const [deviceIndex, setDeviceIndex] = useState(0)

  const libraryRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  /** Dismiss without posting — the draft and its object URL are thrown away. */
  const close = useCallback(() => {
    stopStream()
    setCameraOpen(false); setCameraError(null); setCameraStarting(false)
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null }
    setFile(null); setPreviewUrl(null); setMeta(null)
    setNote(''); setTopicId('')
    setReading(false); setGeocoding(false); setLocating(false); setSaving(false)
    onClose()
  }, [onClose, stopStream])

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

  /** Opens the device camera in-page. Requires a secure context (https or
   *  localhost) and returns a clear reason when it cannot. */
  async function openCamera(id?: string) {
    setCameraError(null)
    setCameraStarting(true)
    setCameraOpen(true)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraStarting(false)
      setCameraError(
        window.isSecureContext === false
          ? 'Camera access needs a secure connection (https). Use “Choose photo” instead.'
          : 'This browser does not support in-page camera capture. Use “Choose photo” instead.'
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCameraLabel(stream.getVideoTracks()[0]?.label || undefined)
      // Device labels are only populated once permission has been granted.
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
        name === 'NotAllowedError' ? 'Camera permission was denied. Allow it in your browser’s site settings, or use “Choose photo”.'
        : name === 'NotFoundError' ? 'No camera was found on this device. Use “Choose photo” instead.'
        : name === 'NotReadableError' ? 'The camera is already in use by another app.'
        : 'Could not start the camera. Use “Choose photo” instead.'
      )
    }
  }

  function closeCamera() {
    stopStream()
    setCameraOpen(false)
    setCameraError(null)
    setCameraStarting(false)
  }

  async function switchCamera() {
    if (deviceIds.length < 2) return
    const next = (deviceIndex + 1) % deviceIds.length
    setDeviceIndex(next)
    await openCamera(deviceIds[next])
  }

  /** Snapshot the live video into a JPEG File and run it through the normal
   *  pipeline. A canvas capture carries no EXIF, so the shutter time and the
   *  camera label are stamped on explicitly. */
  async function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
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
    closeCamera()
    await onPick(captured)
    setMeta(prev => ({
      ...(prev ?? {}),
      capturedAt: shotAt.toISOString(),
      cameraModel: prev?.cameraModel ?? cameraLabel,
      width: prev?.width ?? canvas.width,
      height: prev?.height ?? canvas.height,
    }))
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

                  <input
                    ref={libraryRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => { onPick(e.target.files?.[0]); e.target.value = '' }}
                  />

                  {/* Live camera — works on laptops and phones alike */}
                  {cameraOpen && (
                    <div className="mt-2 rounded-xl border overflow-hidden bg-black">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          playsInline
                          muted
                          autoPlay
                          className="w-full max-h-64 object-cover bg-black"
                        />
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
                            disabled={cameraStarting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                          >
                            <Circle size={14} weight="fill" />
                            Capture
                          </button>
                        </div>
                      )}
                      {cameraLabel && !cameraError && (
                        <p className="px-3 pb-3 -mt-1 text-[11px] text-muted-foreground text-center bg-card truncate">
                          {cameraLabel}
                        </p>
                      )}
                    </div>
                  )}

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
                      onClick={() => openCamera()}
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
