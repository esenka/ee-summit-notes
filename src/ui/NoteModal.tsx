import { useEffect, useRef } from 'react'
import { anchorLabel } from '../anchors'
import { useApp } from '../store'
import { timeAgo } from '../utils'

/** Full content of one note, as a dialog. */
export function NoteModal() {
  const openNoteId = useApp((s) => s.openNoteId)
  const note = useApp((s) => s.notes.find((n) => n.id === s.openNoteId))
  const openNote = useApp((s) => s.openNote)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (openNoteId) closeRef.current?.focus()
  }, [openNoteId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && openNote(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openNote])

  if (!note) return null
  return (
    <div className="modal-backdrop" onClick={() => openNote(null)}>
      <article
        className="note-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Note on ${anchorLabel(note.anchorId)}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="note-modal-head">
          <span className="tag">{anchorLabel(note.anchorId)}</span>
          <button ref={closeRef} className="btn btn-icon" aria-label="Close note" onClick={() => openNote(null)}>×</button>
        </header>
        <h3 className="note-modal-what">{note.what}</h3>
        <dl className="note-modal-body">
          <dt>Methods</dt>
          <dd>
            {note.methods.length > 0 && (
              <span className="tag-row">{note.methods.map((m) => <span key={m} className="tag tag-method">{m}</span>)}</span>
            )}
            {note.how}
          </dd>
          <dt>Why</dt>
          <dd>{note.why}</dd>
        </dl>
        {note.wish.trim() && (
          <p className="note-modal-wish">
            <span className="wish-mark" aria-hidden>?</span>
            <span><strong>Wishes they knew:</strong> {note.wish}</span>
          </p>
        )}
        <footer className="note-modal-foot">
          {note.author ?? 'anonymous'} · {timeAgo(note.createdAt)}
        </footer>
      </article>
    </div>
  )
}
