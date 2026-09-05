'use client'
import { useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Props {
  value: Date | null
  onChange: (date: Date) => void
  className?: string
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABEL = { month: 'long', year: 'numeric' } as const

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Small month-grid date picker — no external dependency, just enough for
 *  scheduling a meeting or filtering a feed by day. */
export function MiniCalendar({ value, onChange, className }: Props) {
  const [viewDate, setViewDate] = useState(() => value ?? new Date())
  const today = new Date()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstOfMonth.getDay()

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1))
  }

  return (
    <div className={cn('select-none', className)}>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Previous month"
        >
          <CaretLeft size={14} />
        </button>
        <p className="text-xs font-semibold text-foreground">{viewDate.toLocaleDateString('en-US', MONTH_LABEL)}</p>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Next month"
        >
          <CaretRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-[10px] font-medium text-muted-foreground text-center py-1">{w}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const isSelected = value && isSameDay(date, value)
          const isToday = isSameDay(date, today)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(date)}
              className={cn(
                'w-8 h-8 mx-auto rounded-full text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                  ? 'text-primary font-semibold hover:bg-muted'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
