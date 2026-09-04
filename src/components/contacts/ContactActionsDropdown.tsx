'use client'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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
  actions: ContactAction[]
}

/** Small anchored dropdown for the secondary quick actions — the caller
 *  positions it via a `relative` wrapper around the trigger button. */
export function ContactActionsDropdown({ open, onClose, actions }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  function handleSelect(action: ContactAction) {
    onClose()
    action.onSelect()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 z-50 w-64 bg-card border border-border rounded-2xl shadow-xl p-1.5"
        >
          {actions.map(action => (
            <button
              key={action.key}
              onClick={() => handleSelect(action)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.bg}`}>
                <action.icon size={16} className={action.color} weight="fill" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{action.label}</span>
                {action.sub && <span className="block text-xs text-muted-foreground truncate">{action.sub}</span>}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
