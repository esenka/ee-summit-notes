import { useMemo } from 'react'
import { anchorById } from '../anchors'
import { useApp } from '../store'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'

/** Floating card for the selected anchor: its notes plus the add-note form. */
export function AnchorSheet() {
  const selectedAnchor = useApp((s) => s.selectedAnchor)
  const addingNote = useApp((s) => s.addingNote)
  const setAddingNote = useApp((s) => s.setAddingNote)
  const clearSelection = useApp((s) => s.clearSelection)
  const openNote = useApp((s) => s.openNote)
  const notes = useApp((s) => s.notes)

  const anchor = selectedAnchor ? anchorById.get(selectedAnchor) : undefined
  const anchorNotes = useMemo(
    () => notes.filter((n) => n.anchorId === selectedAnchor),
    [notes, selectedAnchor],
  )

  if (!anchor) return null

  return (
    <section className="anchor-sheet" aria-label={`${anchor.label} notes`}>
      <header className="anchor-sheet-head">
        <div>
          <h2>{anchor.label}</h2>
          <p className="hint">{anchor.hint}</p>
        </div>
        <button className="btn btn-icon" aria-label="Close" onClick={clearSelection}>×</button>
      </header>

      {addingNote ? (
        <NoteForm anchorId={anchor.id} onDone={() => setAddingNote(false)} onCancel={() => setAddingNote(false)} />
      ) : (
        <>
          <button className="btn btn-primary btn-wide" onClick={() => setAddingNote(true)}>
            Add a note here
          </button>
          {anchorNotes.length > 0 && (
            <ul className="note-list note-list-compact">
              {anchorNotes.slice(0, 12).map((n) => (
                <NoteCard key={n.id} note={n} onOpen={openNote} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
