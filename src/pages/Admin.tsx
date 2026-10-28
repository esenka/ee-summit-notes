import { useState, type FormEvent } from 'react'
import { anchorLabel } from '../anchors'
import { adminApi, useApp } from '../store'
import type { Note } from '../types'
import { timeAgo } from '../utils'

/** Password-gated moderation: hide/unhide or delete notes. */
export function Admin() {
  const backendMode = useApp((s) => s.backendMode)
  const refresh = useApp((s) => s.refresh)
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [all, setAll] = useState<Note[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = async (pass: string) => {
    const list = await adminApi.list(pass)
    setAll(list)
  }

  const unlock = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await load(password)
      setUnlocked(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not unlock.')
    }
  }

  const act = async (id: string, fn: () => Promise<void>) => {
    setBusy(id)
    setError(null)
    try {
      await fn()
      await load(password)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="admin-page">
      <header className="submit-head">
        <h1>Encoding Experiences Summit moderation</h1>
        <p>Hide a note to take it off the wall (reversible). Delete removes it for good.</p>
      </header>

      {!unlocked ? (
        <form className="admin-unlock" onSubmit={unlock}>
          <label className="field">
            <span className="field-label">Admin password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </label>
          {backendMode === 'demo' && <p className="hint">Demo mode password: <code>demo</code></p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit">Unlock</button>
        </form>
      ) : (
        <>
          {error && <p className="form-error" role="alert">{error}</p>}
          <table className="admin-table">
            <thead>
              <tr>
                <th>Note</th>
                <th>Anchor</th>
                <th>By</th>
                <th>When</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {all.map((n) => (
                <tr key={n.id} className={n.hidden ? 'row-hidden' : undefined}>
                  <td>
                    <strong>{n.what}</strong>
                    {n.wish.trim() && <em> wishes: {n.wish}</em>}
                  </td>
                  <td>{anchorLabel(n.anchorId)}</td>
                  <td>{n.author ?? 'anonymous'}</td>
                  <td>{timeAgo(n.createdAt)}</td>
                  <td className="admin-actions">
                    <button
                      className="btn"
                      disabled={busy === n.id}
                      onClick={() => act(n.id, () => adminApi.setHidden(n.id, !n.hidden, password))}
                    >
                      {n.hidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={busy === n.id}
                      onClick={() => {
                        if (confirm('Delete this note permanently?')) {
                          void act(n.id, () => adminApi.remove(n.id, password))
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
