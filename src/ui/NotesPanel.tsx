import { useMemo } from 'react'
import { ANCHORS } from '../anchors'
import { filteredNotes, searchNotes, useApp } from '../store'
import { METHOD_PRESETS } from '../types'
import { NoteCard } from './NoteCard'

/** Side panel: search, filters and the full (filtered) list of notes. */
export function NotesPanel() {
  const notes = useApp((s) => s.notes)
  const filterAnchor = useApp((s) => s.filterAnchor)
  const filterMethod = useApp((s) => s.filterMethod)
  const wishOnly = useApp((s) => s.wishOnly)
  const search = useApp((s) => s.search)
  const setFilterAnchor = useApp((s) => s.setFilterAnchor)
  const setFilterMethod = useApp((s) => s.setFilterMethod)
  const setWishOnly = useApp((s) => s.setWishOnly)
  const setSearch = useApp((s) => s.setSearch)
  const setPanelOpen = useApp((s) => s.setPanelOpen)
  const openNote = useApp((s) => s.openNote)
  const selectAnchor = useApp((s) => s.selectAnchor)

  const methodOptions = useMemo(() => {
    const extra = new Set<string>()
    notes.forEach((n) => n.methods.forEach((m) => extra.add(m)))
    METHOD_PRESETS.forEach((m) => extra.delete(m))
    return [...METHOD_PRESETS, ...[...extra].sort()]
  }, [notes])

  const shown = useMemo(
    () => searchNotes(filteredNotes({ notes, filterAnchor, filterMethod, wishOnly }), search),
    [notes, filterAnchor, filterMethod, wishOnly, search],
  )

  const open = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) selectAnchor(note.anchorId)
    openNote(id)
  }

  return (
    <aside className="notes-panel" aria-label="All notes">
      <header className="notes-panel-head">
        <h2>Notes <span className="count">{shown.length}</span></h2>
        <button className="btn btn-icon" aria-label="Close notes panel" onClick={() => setPanelOpen(false)}>×</button>
      </header>

      <input
        type="search"
        className="search"
        placeholder="Search notes…"
        aria-label="Search notes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        <label>
          <span>Anchor</span>
          <select value={filterAnchor ?? ''} onChange={(e) => setFilterAnchor(e.target.value || null)}>
            <option value="">All anchors</option>
            {ANCHORS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Method</span>
          <select value={filterMethod ?? ''} onChange={(e) => setFilterMethod(e.target.value || null)}>
            <option value="">All methods</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={wishOnly} onChange={(e) => setWishOnly(e.target.checked)} />
          <span>Only “wish I knew”</span>
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="empty">No notes match. Clear a filter, or add the first one.</p>
      ) : (
        <ul className="note-list">
          {shown.map((n) => (
            <NoteCard key={n.id} note={n} onOpen={open} wishFirst={wishOnly} />
          ))}
        </ul>
      )}
    </aside>
  )
}
