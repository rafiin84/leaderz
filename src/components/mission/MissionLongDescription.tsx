'use client'
import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import type { MissionSection } from '@/types/mission'

interface Props {
  sections: MissionSection[]
}

/** Roughly ten lines of body copy at this type size, so the collapsed block
 *  shows a meaningful opening rather than a teaser. */
const COLLAPSED_MAX_HEIGHT = 280

/**
 * The mission's long-form write-up.
 *
 * Collapsed to about ten lines with a fade at the cut, expanded in full by the
 * toggle. Height-based rather than line-clamped because the block is several
 * headed sections, not one paragraph.
 */
export function MissionLongDescription({ sections }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!sections.length) return null

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: expanded ? 4000 : COLLAPSED_MAX_HEIGHT }}
      >
        <div className="space-y-4">
          {sections.map(s => (
            <section key={s.heading}>
              <h3 className="text-sm font-semibold text-foreground mb-1">{s.heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        {/* Fade so the cut reads as "more below" rather than a hard crop. */}
        {!expanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        {expanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  )
}
