import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { NewNote, Note } from '../types'
import type { NotesBackend } from './types'

interface NoteRow {
  id: string
  anchor_id: string
  what: string
  how: string
  why: string
  wish: string
  methods: string[]
  author: string | null
  hidden: boolean
  created_at: string
}

const fromRow = (r: NoteRow): Note => ({
  id: r.id,
  anchorId: r.anchor_id,
  what: r.what,
  how: r.how,
  why: r.why,
  wish: r.wish,
  methods: r.methods ?? [],
  author: r.author,
  hidden: r.hidden,
  createdAt: r.created_at,
})

export function createSupabaseBackend(url: string, anonKey: string): NotesBackend {
  const client: SupabaseClient = createClient(url, anonKey)

  return {
    mode: 'supabase',
    async list() {
      const { data, error } = await client
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as NoteRow[]).map(fromRow)
    },
    async insert(note: NewNote) {
      const { error } = await client.from('notes').insert({
        anchor_id: note.anchorId,
        what: note.what,
        how: note.how,
        why: note.why,
        wish: note.wish,
        methods: note.methods,
        author: note.author,
      })
      if (error) throw error
    },
    subscribe(onChange) {
      const channel = client
        .channel('notes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, onChange)
        .subscribe()
      return () => {
        client.removeChannel(channel)
      }
    },
    async adminList(password) {
      const { data, error } = await client.rpc('admin_list_notes', { admin_password: password })
      if (error) throw error
      return (data as NoteRow[]).map(fromRow)
    },
    async setHidden(id, hidden, password) {
      const { error } = await client.rpc('admin_set_hidden', {
        note_id: id,
        hide: hidden,
        admin_password: password,
      })
      if (error) throw error
    },
    async remove(id, password) {
      const { error } = await client.rpc('admin_delete_note', {
        note_id: id,
        admin_password: password,
      })
      if (error) throw error
    },
  }
}
