'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'

export interface ContactAction {
  key: string
  icon: React.ElementType
  label: string
  sub?: string
  color: string
  bg: string
  onSelect: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  recipientName: string
  actions: ContactAction[]
}

export function ContactActionsSheet({ open, onClose, recipientName, actions }: Props) {
  function handleSelect(action: ContactAction) {
    onClose()
    action.onSelect()
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
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Quick actions</p>
                <p className="text-sm font-semibold text-foreground">{recipientName}</p>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 space-y-1 pb-6 md:pb-3">
              {actions.map(action => (
                <button
                  key={action.key}
                  onClick={() => handleSelect(action)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.bg}`}>
                    <action.icon size={19} className={action.color} weight="fill" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{action.label}</span>
                    {action.sub && <span className="block text-xs text-muted-foreground truncate">{action.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
