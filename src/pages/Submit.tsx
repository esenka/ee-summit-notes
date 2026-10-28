import { useState } from 'react'
import { NoteForm } from '../ui/NoteForm'

/** Mobile-first form reached by scanning the projector QR code. */
export function Submit() {
  const [done, setDone] = useState(false)
  const [formKey, setFormKey] = useState(0)

  return (
    <div className="submit-page">
      <header className="submit-head">
        <h1>Encoding Experiences Summit</h1>
        <p>Pin what you study, and what you wish you knew, onto our shared human figure.</p>
      </header>
      {done ? (
        <div className="submit-done" role="status">
          <p className="submit-done-mark" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 12.5 10 18.5 20 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
          <h2>Your note is on the wall.</h2>
          <p>Look up at the screen. It will materialize in the room shortly.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setDone(false)
              setFormKey((k) => k + 1)
            }}
          >
            Add another note
          </button>
        </div>
      ) : (
        <NoteForm key={formKey} anchorId={null} showAnchorPicker onDone={() => setDone(true)} />
      )}
    </div>
  )
}
