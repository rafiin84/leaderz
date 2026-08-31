import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-muted', className)} aria-hidden />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

export function ContactCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}
