'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X, Phone, EnvelopeSimple, Handshake, Note, CalendarBlank,
  Star, Heart, Lightning, CheckCircle, Spinner, CaretDown
} from '@phosphor-icons/react'

type InteractionType = 'call' | 'message' | 'meeting' | 'email' | 'event' | 'note' | 'wish'
type Sentiment = 'positive' | 'neutral' | 'negative'

interface Props {
  open: boolean
  onClose: () => void
  contactName: string
  defaultType?: InteractionType
}

const TYPE_OPTIONS: { type: InteractionType; icon: React.ElementType; label: string; color: string }[] = [
  { type: 'meeting', icon: Handshake, label: 'Meeting', color: 'text-violet-600' },
  { type: 'call', icon: Phone, label: 'Call', color: 'text-emerald-600' },
  { type: 'note', icon: Note, label: 'Note', color: 'text-amber-600' },
  { type: 'message', icon: EnvelopeSimple, label: 'Message', color: 'text-blue-600' },
  { type: 'event', icon: CalendarBlank, label: 'Event', color: 'text-rose-600' },
  { type: 'wish', icon: Heart, label: 'Wish', color: 'text-pink-500' },
]

const SENTIMENT_OPTIONS: { value: Sentiment; label: string; dot: string }[] = [
  { value: 'positive', label: 'Positive', dot: 'bg-emerald-500' },
  { value: 'neutral', label: 'Neutral', dot: 'bg-muted-foreground' },
  { value: 'negative', label: 'Needs attention', dot: 'bg-red-400' },
]

export function LogInteractionSheet({ open, onClose, contactName, defaultType = 'note' }: Props) {
  const [type, setType] = useState<InteractionType>(defaultType)
  const [summary, setSummary] = useState('')
  const [sentiment, setSentiment] = useState<Sentiment>('positive')
  const [followUp, setFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpNote, setFollowUpNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!summary.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    setSaved(true)
    await new Promise(r => setTimeout(r, 700))
    onClose()
    setSummary('')
    setFollowUp(false)
    setFollowUpDate('')
    setFollowUpNote('')
    setSaved(false)
    setType(defaultType)
    setSentiment('positive')
  }

  const canSave = summary.trim().length > 0 && !saving

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
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border flex flex-col max-h-[88dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Log interaction</p>
                <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{contactName}</p>
              </div>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
              >
                {saving ? <Spinner size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} weight="fill" /> : 'Save'}
              </button>
            </div>

            {/* Type picker */}
            <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto shrink-0">
              {TYPE_OPTIONS.map(({ type: t, icon: Icon, label, color }) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    type === t ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={14} className={type === t ? 'text-primary' : color} weight={type === t ? 'fill' : 'regular'} />
                  {label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {/* Summary */}
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder={getPlaceholder(type, contactName)}
                className="w-full resize-none bg-muted rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
                maxLength={1000}
              />

              {/* Sentiment */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">How did it go?</p>
                <div className="flex gap-2">
                  {SENTIMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSentiment(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        sentiment === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up */}
              <div className="rounded-2xl border bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightning size={16} className="text-amber-500" weight="fill" />
                    <p className="text-sm font-medium text-foreground">Set follow-up</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={followUp}
                    onClick={() => setFollowUp(!followUp)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${followUp ? 'bg-primary' : 'bg-border'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${followUp ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {followUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-2">
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={e => setFollowUpDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <input
                          type="text"
                          value={followUpNote}
                          onChange={e => setFollowUpNote(e.target.value)}
                          placeholder="Follow-up note (optional)"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          maxLength={200}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function getPlaceholder(type: InteractionType, name: string): string {
  switch (type) {
    case 'meeting': return `What did you discuss with ${name.split(' ')[0]}?`
    case 'call': return `How did the call go with ${name.split(' ')[0]}?`
    case 'note': return `Add a note about ${name.split(' ')[0]}...`
    case 'message': return `What did you message ${name.split(' ')[0]} about?`
    case 'event': return `What event did you attend with ${name.split(' ')[0]}?`
    case 'wish': return `What occasion did you wish ${name.split(' ')[0]} for?`
    default: return 'Add interaction details...'
  }
}
