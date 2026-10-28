import { useState } from 'react'
import { exportCSV, exportJSON } from '../export'
import { useApp } from '../store'

export function Header() {
  const notes = useApp((s) => s.notes)
  const wishOnly = useApp((s) => s.wishOnly)
  const setWishOnly = useApp((s) => s.setWishOnly)
  const panelOpen = useApp((s) => s.panelOpen)
  const setPanelOpen = useApp((s) => s.setPanelOpen)
  const notesVisible = useApp((s) => s.notesVisible)
  const setNotesVisible = useApp((s) => s.setNotesVisible)
  const resetView = useApp((s) => s.resetView)
  const backendMode = useApp((s) => s.backendMode)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>Encoding Experiences Summit</h1>
        <p className="app-subtitle">measuring human experience in neuroarchitecture</p>
      </div>
      <nav className="app-nav" aria-label="View controls">
        {backendMode === 'demo' && <span className="tag tag-demo" title="No backend configured: notes stay in this browser">demo mode</span>}
        <button
          className={`btn${wishOnly ? ' btn-on' : ''}`}
          aria-pressed={wishOnly}
          onClick={() => setWishOnly(!wishOnly)}
        >
          <span className="wish-mark" aria-hidden>?</span> Wish I knew
        </button>
        <button
          className={`btn${notesVisible ? '' : ' btn-on'}`}
          aria-pressed={!notesVisible}
          title={notesVisible ? 'Hide the post-its in the scene' : 'Show the post-its in the scene'}
          onClick={() => setNotesVisible(!notesVisible)}
        >
          {notesVisible ? 'Hide post-its' : 'Show post-its'}
        </button>
        <button className={`btn${panelOpen ? ' btn-on' : ''}`} aria-pressed={panelOpen} onClick={() => setPanelOpen(!panelOpen)}>
          Notes <span className="count">{notes.length}</span>
        </button>
        <button className="btn" onClick={resetView}>Reset view</button>
        <div className="menu-wrap">
          <button className="btn" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen(!menuOpen)}>
            More
          </button>
          {menuOpen && (
            <div className="menu" role="menu" onClick={() => setMenuOpen(false)}>
              <button role="menuitem" onClick={() => exportJSON(notes)}>Export JSON</button>
              <button role="menuitem" onClick={() => exportCSV(notes)}>Export CSV</button>
              <a role="menuitem" href="#/projector">Projector mode</a>
              <a role="menuitem" href="#/submit">Submission page</a>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
