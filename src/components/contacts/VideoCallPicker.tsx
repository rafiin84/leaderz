'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { X, VideoCamera } from '@phosphor-icons/react'

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
}

const PROVIDERS = [
  { label: 'Google Meet', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40', url: 'https://meet.google.com/new' },
  { label: 'Zoom', color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/40', url: 'https://zoom.us/start/videomeeting' },
]

export function VideoCallPicker({ open, onClose, recipientName }: Props) {
  function start(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[380px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Start a video call</p>
                <p className="text-sm font-semibold text-foreground">{recipientName}</p>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 space-y-2 pb-6 md:pb-3">
              {PROVIDERS.map(p => (
                <button
                  key={p.label}
                  onClick={() => start(p.url)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.bg}`}>
                    <VideoCamera size={18} className={p.color} weight="fill" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{p.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
