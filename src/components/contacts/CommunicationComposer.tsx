'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X, Cake, Lightning, Heart, PaperPlaneTilt, Spinner, CheckCircle,
  WhatsappLogo, EnvelopeSimple, Phone
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type MessageContext = 'birthday' | 'followup' | 'thankyou' | 'custom'
type Channel = 'whatsapp' | 'email' | 'call'

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
  context?: MessageContext
}

const CONTEXT_CONFIG: Record<MessageContext, {
  icon: React.ElementType
  color: string
  bg: string
  title: string
  templates: string[]
}> = {
  birthday: {
    icon: Cake,
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
    title: 'Birthday wish',
    templates: [
      'Wishing you a wonderful birthday, {first}! Hope the day brings you much joy.',
      'Happy birthday, {first}! Grateful for your support of the mission.',
      'Many happy returns, {first}! Looking forward to continuing our work together.',
    ],
  },
  followup: {
    icon: Lightning,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    title: 'Follow-up',
    templates: [
      'Hi {first}, just following up on our last conversation. Would love to reconnect.',
      'Hi {first}, wanted to check in — any updates on your end?',
      'Hi {first}, it\'s been a while. Hope things are going well. Let\'s find time to talk.',
    ],
  },
  thankyou: {
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-100 dark:bg-pink-900/40',
    title: 'Thank you note',
    templates: [
      'Dear {first}, thank you for your continued support. It means a great deal.',
      'Hi {first}, I\'m deeply grateful for what you\'ve contributed to the mission.',
      '{first}, your involvement makes a real difference. Thank you sincerely.',
    ],
  },
  custom: {
    icon: PaperPlaneTilt,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Message',
    templates: [],
  },
}

const CHANNELS: { value: Channel; icon: React.ElementType; label: string }[] = [
  { value: 'whatsapp', icon: WhatsappLogo, label: 'WhatsApp' },
  { value: 'email', icon: EnvelopeSimple, label: 'Email' },
  { value: 'call', icon: Phone, label: 'Call' },
]

export function CommunicationComposer({ open, onClose, recipientName, context = 'custom' }: Props) {
  const firstName = recipientName.split(' ')[0]
  const config = CONTEXT_CONFIG[context]
  const Icon = config.icon

  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function applyTemplate(template: string) {
    setMessage(template.replace(/{first}/g, firstName))
  }

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    setSending(false)
    setSent(true)
    await new Promise(r => setTimeout(r, 800))
    onClose()
    setMessage('')
    setSent(false)
  }

  const canSend = message.trim().length > 0 && !sending

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
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center', config.bg)}>
                  <Icon size={14} className={config.color} weight="fill" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{config.title}</p>
                  <p className="text-sm font-semibold text-foreground">{recipientName}</p>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
              >
                {sending ? (
                  <Spinner size={15} className="animate-spin" />
                ) : sent ? (
                  <CheckCircle size={15} weight="fill" />
                ) : (
                  <>
                    <PaperPlaneTilt size={14} weight="fill" />
                    Send
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-4">
              {/* Channel selector */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Send via</p>
                <div className="flex gap-2">
                  {CHANNELS.map(({ value, icon: CIcon, label }) => (
                    <button
                      key={value}
                      onClick={() => setChannel(value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                        channel === value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      <CIcon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              {config.templates.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Quick templates</p>
                  <div className="space-y-2">
                    {config.templates.map((t, i) => {
                      const preview = t.replace(/{first}/g, firstName)
                      return (
                        <button
                          key={i}
                          onClick={() => applyTemplate(t)}
                          className={cn(
                            'w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all leading-relaxed',
                            message === preview
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/40'
                          )}
                        >
                          {preview}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Message textarea */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {config.templates.length > 0 ? 'Or write your own' : 'Message'}
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Write a message to ${firstName}…`}
                  className="w-full resize-none bg-muted rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px]"
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
