'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Handshake, CheckCircle, MapPin } from '@phosphor-icons/react'
import { MiniCalendar } from '@/components/common/MiniCalendar'

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
  onSave: (date: Date, time: string, location: string, note: string) => void
}

export function MeetingScheduler({ open, onClose, recipientName, onSave }: Props) {
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  function handleClose() {
    onClose()
    setDate(null)
    setTime('10:00')
    setLocation('')
    setNote('')
  }

  function handleSave() {
    if (!date) return
    onSave(date, time, location.trim(), note.trim())
    handleClose()
  }

  const canSave = date !== null

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
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border flex flex-col max-h-[88dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button onClick={handleClose} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-900/40">
                  <Handshake size={14} className="text-violet-600" weight="fill" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Schedule meeting</p>
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
              <MiniCalendar value={date} onChange={setDate} />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Time</p>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Location</p>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Optional"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Agenda</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={`What do you want to discuss with ${recipientName.split(' ')[0]}?`}
                  className="w-full resize-none bg-muted rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[90px]"
                  maxLength={500}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
