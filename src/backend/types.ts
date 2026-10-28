import type { NewNote, Note } from '../types'

export interface NotesBackend {
  readonly mode: 'supabase' | 'demo'
  /** Visible notes, newest first. */
  list(): Promise<Note[]>
  insert(note: NewNote): Promise<void>
  /** Calls onChange whenever notes change anywhere; returns an unsubscribe fn. */
  subscribe(onChange: () => void): () => void
  /** All notes including hidden ones. Requires the admin password. */
  adminList(password: string): Promise<Note[]>
  setHidden(id: string, hidden: boolean, password: string): Promise<void>
  remove(id: string, password: string): Promise<void>
}
