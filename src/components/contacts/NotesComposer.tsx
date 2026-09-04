'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Note, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
  onSave: (content: string) => void
}

const STARTERS = [
  { label: 'Meeting', text: 'Met to discuss ' },
  { label: 'Call', text: 'Spoke on a call about ' },
  { label: 'Reminder', text: 'Remember to follow up on ' },
  { label: 'General', text: '' },
]

export function NotesComposer({ open, onClose, recipientName, onSave }: Props) {
  const firstName = recipientName.split(' ')[0]
  const [content, setContent] = useState('')
  const [starter, setStarter] = useState<string | null>(null)

  function applyStarter(label: string, text: string) {
    setStarter(label)
    setContent(text)
  }

  function handleClose() {
    onClose()
    setContent('')
    setStarter(null)
  }

  function handleSave() {
    if (!content.trim()) return
    onSave(content.trim())
    handleClose()
  }

  const canSave = content.trim().length > 0

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
            onClick={handleClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button onClick={handleClose} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/40">
                  <Note size={14} className="text-amber-600" weight="fill" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Note</p>
                  <p className="text-sm font-semibold text-foreground">{recipientName}</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-opacity"
              >
                <CheckCircle size={14} weight="fill" />
                Save
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-4">
              {/* Starters */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick start</p>
                <div className="flex flex-wrap gap-1.5">
                  {STARTERS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => applyStarter(s.label, s.text)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                        starter === s.label
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note text */}
              <div>
                <textarea
                  autoFocus
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={`Add a note about ${firstName}…`}
                  className="w-full resize-none bg-muted rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[140px]"
                  maxLength={1000}
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{content.length}/1000</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
