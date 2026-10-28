import { createMemoryBackend } from './memory'
import { createSupabaseBackend } from './supabase'
import type { NotesBackend } from './types'

export type { NotesBackend } from './types'

/** Supabase when configured via .env, otherwise the in-memory demo backend. */
export function createBackend(): NotesBackend {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (url && anonKey) return createSupabaseBackend(url, anonKey)
  return createMemoryBackend()
}
