import { useState, type FormEvent } from 'react'
import { ANCHORS } from '../anchors'
import { useApp } from '../store'
import { FIELD_LIMIT, METHOD_PRESETS, type NewNote } from '../types'

interface Props {
  anchorId: string | null
  /** Show the visual anchor list (submit page); the main page locks it from the 3D click. */
  showAnchorPicker?: boolean
  /** Called after a successful submit. */
  onDone: () => void
  /** Renders a Cancel button when provided. */
  onCancel?: () => void
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  wish,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder: string
  wish?: boolean
}) {
  return (
    <label className={`field${wish ? ' field-wish' : ''}`}>
      <span className="field-label">
        {wish && <span className="wish-mark" aria-hidden>?</span>}
        {label}
        <span className="field-count">{value.length}/{FIELD_LIMIT}</span>
      </span>
      <textarea
        value={value}
        required={required}
        maxLength={FIELD_LIMIT}
        rows={2}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function NoteForm({ anchorId, showAnchorPicker = false, onDone, onCancel }: Props) {
  const addNote = useApp((s) => s.addNote)
  const [anchor, setAnchor] = useState(anchorId)
  const [what, setWhat] = useState('')
  const [how, setHow] = useState('')
  const [why, setWhy] = useState('')
  const [wish, setWish] = useState('')
  const [methods, setMethods] = useState<string[]>([])
  const [author, setAuthor] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleMethod = (m: string) =>
    setMethods((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!anchor) {
      setError('Pick a place for your note first.')
      return
    }
    setSaving(true)
    setError(null)
    const note: NewNote = {
      anchorId: anchor,
      what: what.trim(),
      how: how.trim(),
      why: why.trim(),
      wish: wish.trim(),
      methods,
      author: author.trim() || null,
    }
    try {
      await addNote(note)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the note. Try again.')
      setSaving(false)
    }
  }

  return (
    <form className="note-form" onSubmit={submit}>
      {showAnchorPicker && (
        <fieldset className="anchor-picker">
          <legend>Where does your note belong?</legend>
          {(['body', 'room'] as const).map((kind) => (
            <div key={kind} className="anchor-picker-group">
              <span className="anchor-picker-kind">{kind === 'body' ? 'On the body' : 'In the room'}</span>
              <div className="chip-row">
                {ANCHORS.filter((a) => a.kind === kind).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`chip${anchor === a.id ? ' chip-on' : ''}`}
                    aria-pressed={anchor === a.id}
                    onClick={() => setAnchor(a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
      )}

      <Field label="What do people study?" value={what} onChange={setWhat} required placeholder="e.g. stress recovery in waiting rooms" />

      <div className="field">
        <span className="field-label">Using what methods?</span>
        <div className="chip-row">
          {METHOD_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip chip-small${methods.includes(m) ? ' chip-on' : ''}`}
              aria-pressed={methods.includes(m)}
              onClick={() => toggleMethod(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <Field label="…in your own words" value={how} onChange={setHow} required placeholder="e.g. mobile EEG during real site visits" />

      <Field label="Why?" value={why} onChange={setWhy} required placeholder="the question behind the work" />

      <Field label="What do you wish you knew?" value={wish} onChange={setWish} wish placeholder="the open question, the 4th dimension" />

      <label className="field">
        <span className="field-label">Name or role <em>(optional, blank stays anonymous)</em></span>
        <input value={author} maxLength={60} placeholder="e.g. Ana, lighting researcher" onChange={(e) => setAuthor(e.target.value)} />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Placing…' : 'Place the note'}
        </button>
      </div>
    </form>
  )
}
