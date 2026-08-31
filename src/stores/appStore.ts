'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types/common'
import { MOCK_TENANTS } from '@/data/mock/leaders'

interface AppState {
  activeTenantId: string
  activeUserId: string
  userRole: UserRole
  theme: 'light' | 'dark' | 'system'
  onboardingComplete: boolean
  onboardingStep: number

  setActiveTenant: (tenantId: string) => void
  setUserRole: (role: UserRole) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  completeOnboarding: () => void
  setOnboardingStep: (step: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTenantId: 'tenant-sridhar',
      activeUserId: 'leader-sridhar',
      userRole: 'leader',
      theme: 'system',
      onboardingComplete: true,
      onboardingStep: 0,

      setActiveTenant: (tenantId) => {
        const tenant = MOCK_TENANTS.find(t => t.id === tenantId)
        if (!tenant) return
        set({
          activeTenantId: tenantId,
          activeUserId: tenantId === 'tenant-sridhar' ? 'leader-sridhar' : 'leader-anitha',
          userRole: 'leader',
        })
      },
      setUserRole: (role) => set({ userRole: role }),
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
    }),
    { name: 'leaderz-app-store' }
  )
)
