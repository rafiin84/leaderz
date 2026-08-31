'use client'
import { initials } from '@/lib/formatting'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  verified?: boolean
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
}

export function Avatar({ src, name, size = 'md', className, verified }: AvatarProps) {
  const sizeClass = sizeMap[size]
  const px = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64, '2xl': 96 }[size]

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span className={cn('rounded-full overflow-hidden bg-primary/10 flex items-center justify-center font-semibold text-primary select-none', sizeClass)}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span>{initials(name)}</span>
        )}
      </span>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      )}
    </span>
  )
}
