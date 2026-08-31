'use client'
import { useState } from 'react'
import { CaretUpDown, Check } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { MOCK_TENANTS } from '@/data/mock/leaders'
import { Avatar } from './Avatar'
import { cn } from '@/lib/utils'

export function TenantSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const { activeTenantId, setActiveTenant, userRole } = useAppStore()
  const activeTenant = MOCK_TENANTS.find(t => t.id === activeTenantId)!

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors',
          compact ? 'gap-1.5' : 'gap-2'
        )}
        aria-label="Switch tenant"
        aria-expanded={open}
      >
        <Avatar src={activeTenant.avatarUrl} name={activeTenant.leaderName} size="sm" />
        {!compact && (
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{activeTenant.leaderName}</p>
            <p className="text-xs text-muted-foreground truncate leading-tight capitalize">{userRole.replace('_', ' ')}</p>
          </div>
        )}
        <CaretUpDown size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-card border rounded-2xl shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Switch Leader</p>
              {MOCK_TENANTS.map(tenant => (
                <button
                  key={tenant.id}
                  onClick={() => { setActiveTenant(tenant.id); setOpen(false) }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <Avatar src={tenant.avatarUrl} name={tenant.leaderName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tenant.leaderName}</p>
                    <p className="text-xs text-muted-foreground truncate">{tenant.leaderTitle}</p>
                  </div>
                  {tenant.id === activeTenantId && <Check size={14} className="text-primary shrink-0" />}
                </button>
              ))}
            </div>
            <div className="border-t p-2">
              {(['leader', 'team_admin', 'follower'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => { useAppStore.getState().setUserRole(role); setOpen(false) }}
                  className={cn('w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors', userRole === role ? 'text-primary font-medium' : 'text-muted-foreground')}
                >
                  View as: <span className="capitalize">{role.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
