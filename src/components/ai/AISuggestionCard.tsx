'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, X, BookmarkSimple, ArrowRight } from '@phosphor-icons/react'
import type { AISuggestion } from '@/types/common'
import { cn } from '@/lib/utils'

interface Props {
  suggestion: AISuggestion
  onDismiss?: (id: string) => void
}

const priorityColors = {
  high: 'border-border bg-muted/40',
  medium: 'border-border bg-muted/40',
  low: 'border-border bg-card',
}

export function AISuggestionCard({ suggestion, onDismiss }: Props) {
  const [saved, setSaved] = useState(false)
  const [visible, setVisible] = useState(true)

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss?.(suggestion.id), 300)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('rounded-2xl border p-4', priorityColors[suggestion.priority])}
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-muted shrink-0 mt-0.5">
              <Sparkle size={14} className="text-foreground/60" weight="fill" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSaved(s => !s)}
                    className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                    aria-label={saved ? 'Unsave' : 'Save'}
                  >
                    <BookmarkSimple size={14} weight={saved ? 'fill' : 'regular'} className="text-foreground/50" />
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{suggestion.body}</p>

              <div className="flex items-center gap-2 mt-2.5">
                <p className="text-[10px] text-muted-foreground italic">Why: {suggestion.reason}</p>
              </div>

              {suggestion.actionLabel && (
                <button className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  {suggestion.actionLabel}
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
