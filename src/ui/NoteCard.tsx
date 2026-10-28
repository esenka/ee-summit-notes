import { anchorLabel } from '../anchors'
import { noteColor, noteTilt } from '../scene/textures'
import type { Note } from '../types'
import { timeAgo } from '../utils'

/** Post-it styled note for lists. Click opens the full note. */
export function NoteCard({ note, onOpen, wishFirst = false }: { note: Note; onOpen: (id: string) => void; wishFirst?: boolean }) {
  const showWish = wishFirst && note.wish.trim()
  return (
    <li>
      <button
        className={`note-card${showWish ? ' note-card-wish' : ''}`}
        style={{
          background: showWish ? undefined : noteColor(note),
          transform: `rotate(${noteTilt(note) * 18}deg)`,
        }}
        onClick={() => onOpen(note.id)}
      >
        <span className="note-card-text">{showWish ? note.wish : note.what}</span>
        <span className="note-card-meta">
          {anchorLabel(note.anchorId)} · {note.author ?? 'anonymous'} · {timeAgo(note.createdAt)}
        </span>
        {!showWish && note.wish.trim() && <span className="wish-mark note-card-mark" title="Has an open question" aria-label="Has an open question">?</span>}
      </button>
    </li>
  )
}
