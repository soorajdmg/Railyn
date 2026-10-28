import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Tab = 'map' | 'search' | 'explore' | 'saved' | 'info'
export type SnapPos = 628 | 400 | 54

export interface SheetEntity {
  kind: 'train' | 'station' | 'line' | 'between'
  id: string
}

export interface SavedEntity {
  kind: 'train' | 'station' | 'line'
  id: string
  code: string
  title: string
  sub: string
  ts: number
}

interface AppState {
  tab: Tab
  setTab: (tab: Tab) => void

  sheetStack: SheetEntity[]
  snap: SnapPos
  pushSheet: (entity: SheetEntity) => void
  replaceSheet: (entity: SheetEntity) => void
  popSheet: () => void
  closeSheet: () => void
  setSnap: (snap: SnapPos) => void

  layersOpen: boolean
  toggleLayers: () => void
  coverageOutline: boolean
  toggleCoverage: () => void
  stationLabels: boolean
  toggleLabels: () => void

  toast: string | null
  showToast: (msg: string) => void

  favourites: SavedEntity[]
  recentlyViewed: SavedEntity[]
  toggleFavourite: (entity: SavedEntity) => void
  addRecentlyViewed: (entity: SavedEntity) => void
  isFavourite: (kind: string, id: string) => boolean
}

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      tab: 'map',
      setTab: (tab) => set({ tab, layersOpen: false }),

      sheetStack: [],
      snap: 400,
      pushSheet: (entity) => {
        const stack = get().sheetStack
        set({ sheetStack: [...stack, entity], snap: 400 })
      },
      replaceSheet: (entity) => set({ sheetStack: [entity], snap: 400 }),
      popSheet: () => {
        const stack = get().sheetStack
        if (stack.length > 1) set({ sheetStack: stack.slice(0, -1) })
        else set({ sheetStack: [] })
      },
      closeSheet: () => set({ sheetStack: [] }),
      setSnap: (snap) => set({ snap }),

      layersOpen: false,
      toggleLayers: () => set(s => ({ layersOpen: !s.layersOpen })),
      coverageOutline: true,
      toggleCoverage: () => set(s => ({ coverageOutline: !s.coverageOutline })),
      stationLabels: true,
      toggleLabels: () => set(s => ({ stationLabels: !s.stationLabels })),

      toast: null,
      showToast: (msg) => {
        set({ toast: msg })
        setTimeout(() => set({ toast: null }), 2200)
      },

      favourites: [],
      recentlyViewed: [],
      toggleFavourite: (entity) => {
        const favs = get().favourites
        const idx = favs.findIndex(f => f.kind === entity.kind && f.id === entity.id)
        if (idx >= 0) {
          set({ favourites: favs.filter((_, i) => i !== idx) })
        } else {
          set({ favourites: [entity, ...favs] })
        }
      },
      addRecentlyViewed: (entity) => {
        const recent = get().recentlyViewed.filter(r => !(r.kind === entity.kind && r.id === entity.id))
        set({ recentlyViewed: [{ ...entity, ts: Date.now() }, ...recent].slice(0, 12) })
      },
      isFavourite: (kind, id) => get().favourites.some(f => f.kind === kind && f.id === id),
    }),
    {
      name: 'railyn-state',
      partialize: (s) => ({
        favourites: s.favourites,
        recentlyViewed: s.recentlyViewed,
      }),
    }
  )
)
