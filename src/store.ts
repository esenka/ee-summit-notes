import { create } from 'zustand'
import { createBackend } from './backend'
import type { NewNote, Note } from './types'

const backend = createBackend()

interface AppState {
  backendMode: 'supabase' | 'demo'
  notes: Note[]
  loading: boolean

  hoveredAnchor: string | null
  selectedAnchor: string | null
  openNoteId: string | null
  addingNote: boolean
  panelOpen: boolean

  filterAnchor: string | null
  filterMethod: string | null
  wishOnly: boolean
  search: string
  /** Show or hide the post-it sprites in the 3D scene. */
  notesVisible: boolean

  /** Bumped counters let the camera rig react to repeated requests. */
  focusRequest: { anchorId: string; seq: number } | null
  resetSeq: number

  init: () => () => void
  refresh: () => Promise<void>
  addNote: (note: NewNote) => Promise<void>

  setHovered: (id: string | null) => void
  selectAnchor: (id: string) => void
  clearSelection: () => void
  openNote: (id: string | null) => void
  setAddingNote: (open: boolean) => void
  setPanelOpen: (open: boolean) => void
  resetView: () => void

  setFilterAnchor: (id: string | null) => void
  setFilterMethod: (m: string | null) => void
  setWishOnly: (v: boolean) => void
  setSearch: (s: string) => void
  setNotesVisible: (v: boolean) => void
}

export const useApp = create<AppState>((set, get) => ({
  backendMode: backend.mode,
  notes: [],
  loading: true,

  hoveredAnchor: null,
  selectedAnchor: null,
  openNoteId: null,
  addingNote: false,
  panelOpen: false,

  filterAnchor: null,
  filterMethod: null,
  wishOnly: false,
  search: '',
  notesVisible: true,

  focusRequest: null,
  resetSeq: 0,

  init: () => {
    void get().refresh()
    return backend.subscribe(() => void get().refresh())
  },

  refresh: async () => {
    const notes = await backend.list()
    set({ notes, loading: false })
  },

  addNote: async (note) => {
    await backend.insert(note)
    await get().refresh()
  },

  setHovered: (id) => set({ hoveredAnchor: id }),
  selectAnchor: (id) =>
    set((s) => ({
      selectedAnchor: id,
      focusRequest: { anchorId: id, seq: (s.focusRequest?.seq ?? 0) + 1 },
    })),
  clearSelection: () => set({ selectedAnchor: null, addingNote: false }),
  openNote: (id) => set({ openNoteId: id }),
  setAddingNote: (open) => set({ addingNote: open }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  resetView: () =>
    set((s) => ({ resetSeq: s.resetSeq + 1, selectedAnchor: null, focusRequest: null })),

  setFilterAnchor: (id) => set({ filterAnchor: id }),
  setFilterMethod: (m) => set({ filterMethod: m }),
  setWishOnly: (v) => set({ wishOnly: v }),
  setSearch: (s) => set({ search: s }),
  setNotesVisible: (v) => set({ notesVisible: v }),
}))

/** Notes that pass the current filters (search is applied only in the list panel). */
export function filteredNotes(s: Pick<AppState, 'notes' | 'filterAnchor' | 'filterMethod' | 'wishOnly'>): Note[] {
  return s.notes.filter((n) => {
    if (s.filterAnchor && n.anchorId !== s.filterAnchor) return false
    if (s.filterMethod && !n.methods.includes(s.filterMethod) && !n.how.toLowerCase().includes(s.filterMethod.toLowerCase())) return false
    if (s.wishOnly && !n.wish.trim()) return false
    return true
  })
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase()
  if (!q) return notes
  return notes.filter((n) =>
    [n.what, n.how, n.why, n.wish, n.author ?? '', ...n.methods].join(' ').toLowerCase().includes(q),
  )
}

/** Admin actions go straight to the backend; the store stays read-focused. */
export const adminApi = {
  list: (password: string) => backend.adminList(password),
  setHidden: (id: string, hidden: boolean, password: string) => backend.setHidden(id, hidden, password),
  remove: (id: string, password: string) => backend.remove(id, password),
}
