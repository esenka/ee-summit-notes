import type { NewNote, Note } from '../types'
import { SEED_NOTES } from '../seed'
import type { NotesBackend } from './types'

const DEMO_PASSWORD = 'demo'

/**
 * In-memory fallback so the app runs with no backend configured.
 * A BroadcastChannel keeps open tabs in the same browser in sync,
 * which is enough to demo "live" updates.
 */
export function createMemoryBackend(): NotesBackend {
  let notes: Note[] = [...SEED_NOTES]
  const listeners = new Set<() => void>()
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ees-notes') : null

  type Msg = { type: 'add'; note: Note } | { type: 'replace'; notes: Note[] }

  const emit = (broadcast: Msg | null) => {
    listeners.forEach((fn) => fn())
    if (broadcast) channel?.postMessage(broadcast)
  }

  if (channel) {
    channel.onmessage = (e: MessageEvent<Msg>) => {
      // Adds merge by id so tabs can't clobber each other's notes;
      // moderation (hide/delete) replaces wholesale.
      const msg = e.data
      if (msg.type === 'add') {
        if (!notes.some((n) => n.id === msg.note.id)) notes = [msg.note, ...notes]
      } else {
        notes = msg.notes
      }
      emit(null)
    }
  }

  const checkPassword = (password: string) => {
    if (password !== DEMO_PASSWORD) throw new Error('Wrong password (demo mode uses "demo")')
  }

  return {
    mode: 'demo',
    async list() {
      return notes.filter((n) => !n.hidden).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    async insert(note: NewNote) {
      const full: Note = { ...note, id: crypto.randomUUID(), hidden: false, createdAt: new Date().toISOString() }
      notes = [full, ...notes]
      emit({ type: 'add', note: full })
    },
    subscribe(onChange) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    async adminList(password) {
      checkPassword(password)
      return [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    async setHidden(id, hidden, password) {
      checkPassword(password)
      notes = notes.map((n) => (n.id === id ? { ...n, hidden } : n))
      emit({ type: 'replace', notes })
    },
    async remove(id, password) {
      checkPassword(password)
      notes = notes.filter((n) => n.id !== id)
      emit({ type: 'replace', notes })
    },
  }
}
