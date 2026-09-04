'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, EnvelopeSimple, PaperPlaneTilt } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
  email?: string
}

const TEMPLATES: { label: string; subject: string; body: string }[] = [
  {
    label: 'Following up',
    subject: 'Following up',
    body: 'Hi {first},\n\nJust wanted to follow up on our previous conversation. Would love to catch up soon.\n\nBest regards,',
  },
  {
    label: 'Great connecting',
    subject: 'Great connecting with you',
    body: 'Hi {first},\n\nIt was great connecting with you. Looking forward to staying in touch.\n\nBest regards,',
  },
  {
    label: 'Checking in',
    subject: 'Checking in',
    body: 'Hi {first},\n\nHope you are doing well. Wanted to check in and see how things are going.\n\nBest regards,',
  },
]

export function EmailComposer({ open, onClose, recipientName, email }: Props) {
  const firstName = recipientName.split(' ')[0]
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function personalize(text: string) {
    return text.replace(/{first}/g, firstName)
  }

  function applyTemplate(t: typeof TEMPLATES[number]) {
    setSubject(personalize(t.subject))
    setBody(personalize(t.body))
  }

  function handleClose() {
    onClose()
    setSubject('')
    setBody('')
  }

  function handleSend() {
    if (!body.trim() || !email) return
    const url = `mailto:${email}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body.trim())}`
    window.location.href = url
    handleClose()
  }

  const canSend = body.trim().length > 0 && !!email

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
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button onClick={handleClose} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
                  <EnvelopeSimple size={14} className="text-blue-600" weight="fill" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground">{recipientName}</p>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-opacity"
              >
                <PaperPlaneTilt size={14} weight="fill" />
                Send
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-4">
              {!email && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  No email address on file for {firstName}.
                </div>
              )}

              {/* Templates */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggested templates</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.label}
                      onClick={() => applyTemplate(t)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                        subject === personalize(t.subject)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Subject</p>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={150}
                />
              </div>

              {/* Body */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Message</p>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={`Write an email to ${firstName}…`}
                  className="w-full resize-none bg-muted rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[160px]"
                  maxLength={2000}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
