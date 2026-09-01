'use client'
import { Image, Gif, Barbell, ListChecks, Smiley, CalendarPlus, MapPin, Flag } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useLeader } from '@/queries'
import { Avatar } from '@/components/common/Avatar'

const ACTIONS: { icon: React.ElementType; label: string }[] = [
  { icon: Image, label: 'Add photo' },
  { icon: Gif, label: 'Add GIF' },
  { icon: Barbell, label: 'Add poll' },
  { icon: ListChecks, label: 'Add list' },
  { icon: Smiley, label: 'Add emoji' },
  { icon: CalendarPlus, label: 'Schedule' },
  { icon: MapPin, label: 'Tag location' },
  { icon: Flag, label: 'Link mission' },
]

/**
 * Feed-top composer. It is a launcher, not a second editor — every control
 * opens the full PostComposer modal so the publish logic stays in one place.
 */
export function InlineComposer() {
  const { activeTenantId } = useAppStore()
  const { data: leader } = useLeader(activeTenantId)
  const { setPostComposerOpen } = useUIStore()
  const open = () => setPostComposerOpen(true)

  return (
    <section className="border-b px-4 py-3" aria-label="Create a post">
      <div className="flex gap-3">
        <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'You'} size="md" />
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={open}
            className="w-full text-left text-xl text-muted-foreground py-2 hover:text-foreground/70 transition-colors"
          >
            What&rsquo;s happening?
          </button>

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center -ml-2">
              {ACTIONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={open}
                  title={label}
                  aria-label={label}
                  className="p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Icon size={19} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={open}
              className="shrink-0 px-5 py-2 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
