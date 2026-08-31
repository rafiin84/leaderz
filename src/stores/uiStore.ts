'use client'
import { create } from 'zustand'

interface UIState {
  contactSearchQuery: string
  contactCategoryFilter: string | null
  contactPrivacyFilter: string | null
  missionActiveTopicId: string | null
  selectedStateId: string | null
  selectedDistrictId: string | null
  postComposerOpen: boolean
  reelIndex: number
  notificationsPanelOpen: boolean
  sidebarOpen: boolean

  setContactSearch: (q: string) => void
  setContactCategoryFilter: (cat: string | null) => void
  setContactPrivacyFilter: (level: string | null) => void
  setMissionActiveTopic: (id: string | null) => void
  setSelectedState: (id: string | null) => void
  setSelectedDistrict: (id: string | null) => void
  setPostComposerOpen: (open: boolean) => void
  setReelIndex: (index: number) => void
  setNotificationsPanelOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  contactSearchQuery: '',
  contactCategoryFilter: null,
  contactPrivacyFilter: null,
  missionActiveTopicId: null,
  selectedStateId: null,
  selectedDistrictId: null,
  postComposerOpen: false,
  reelIndex: 0,
  notificationsPanelOpen: false,
  sidebarOpen: false,

  setContactSearch: (q) => set({ contactSearchQuery: q }),
  setContactCategoryFilter: (cat) => set({ contactCategoryFilter: cat }),
  setContactPrivacyFilter: (level) => set({ contactPrivacyFilter: level }),
  setMissionActiveTopic: (id) => set({ missionActiveTopicId: id }),
  setSelectedState: (id) => set({ selectedStateId: id, selectedDistrictId: null }),
  setSelectedDistrict: (id) => set({ selectedDistrictId: id }),
  setPostComposerOpen: (open) => set({ postComposerOpen: open }),
  setReelIndex: (index) => set({ reelIndex: index }),
  setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
