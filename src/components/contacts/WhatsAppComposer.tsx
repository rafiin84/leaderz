'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, WhatsappLogo } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { whatsAppNumber } from '@/lib/contactActions'

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
  phone?: string
}

const SUGGESTIONS = [
  'Happy Birthday, {first}! Wishing you a wonderful year ahead.',
  'Looking forward to our meeting, {first}.',
  'Great connecting with you, {first}!',
  'Just following up on our previous conversation.',
  "Hope you're doing well, {first}.",
]

export function WhatsAppComposer({ open, onClose, recipientName, phone }: Props) {
  const firstName = recipientName.split(' ')[0]
  const number = whatsAppNumber(phone)
  const [message, setMessage] = useState('')

  function personalize(template: string) {
    return template.replace(/{first}/g, firstName)
  }

  function handleClose() {
    onClose()
    setMessage('')
  }

  function handleSend() {
    if (!message.trim() || !number) return
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`
    window.open(url, '_blank', 'noopener,noreferrer')
    handleClose()
  }

  const canSend = message.trim().length > 0 && !!number

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
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#25D366]/15">
                  <WhatsappLogo size={15} className="text-[#128C4A] dark:text-[#25D366]" weight="fill" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-semibold text-foreground">{recipientName}</p>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-opacity"
              >
                <WhatsappLogo size={14} weight="fill" />
                Send
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-4">
              {!number && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  No phone number on file for {firstName}.
                </div>
              )}

              {/* Suggestions */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggested messages</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((t, i) => {
                    const preview = personalize(t)
                    return (
                      <button
                        key={i}
                        onClick={() => setMessage(preview)}
                        className={cn(
                          'w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all leading-relaxed',
                          message === preview
                            ? 'border-[#25D366] bg-[#25D366]/8 text-foreground'
                            : 'border-border text-muted-foreground hover:border-[#25D366]/40 hover:bg-muted/40'
                        )}
                      >
                        {preview}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom message */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Or write your own</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Write a message to ${firstName}…`}
                  className="w-full resize-none bg-muted rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{message.length}/500</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
