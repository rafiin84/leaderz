'use client'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RightPanelSwitch } from './RightPanelSwitch'

/** Routes that drop the right panel and take its width instead. */
const FULL_WIDTH_ROUTES = ['/leader/contacts']

/**
 * Content column plus right panel.
 *
 * Lives in a client component so the pathname can decide the shape; the route
 * layout itself stays a server component. On full-width routes the content
 * column absorbs the panel's width (672 + 342), and only from xl — below that
 * the panel is hidden anyway, so the column keeps its normal width.
 */
export function LeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const fullWidth = FULL_WIDTH_ROUTES.some(r => pathname.startsWith(r))

  return (
    <>
      <main className={cn('max-w-full min-w-0', fullWidth ? 'w-[672px] xl:w-[1014px]' : 'w-[672px]')}>
        <div className="has-bottom-nav md:pb-0">{children}</div>
      </main>
      {!fullWidth && <RightPanelSwitch />}
    </>
  )
}
