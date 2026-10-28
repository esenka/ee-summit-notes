import { useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { anchorLabel } from '../anchors'
import { Scene } from '../scene/Scene'
import { useApp } from '../store'

const CYCLE_MS = 9000
const RECENT_COUNT = 10

/** Full-screen auto-rotating view for the venue screen. */
export function Projector() {
  const notes = useApp((s) => s.notes)
  const selectAnchor = useApp((s) => s.selectAnchor)
  const [index, setIndex] = useState(0)

  const recent = useMemo(() => notes.slice(0, RECENT_COUNT), [notes])
  const featured = recent.length > 0 ? recent[index % recent.length] : null

  // Cycle through recent notes; the camera glides to each note's anchor
  // and keeps slowly orbiting around it.
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => i + 1), CYCLE_MS)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (featured) selectAnchor(featured.anchorId)
  }, [featured, selectAnchor])

  const submitUrl = `${location.origin}${location.pathname}#/submit`

  return (
    <div className="projector">
      <Scene autoRotate interactive={false} />
      <header className="projector-title">
        <h1>Encoding Experiences Summit</h1>
        <p>{notes.length} notes on how we measure human experience</p>
      </header>
      {featured && (
        <article className="projector-note" key={featured.id} aria-live="polite">
          <span className="tag">{anchorLabel(featured.anchorId)}</span>
          <h2>{featured.what}</h2>
          <p><strong>How</strong> {featured.how}</p>
          <p><strong>Why</strong> {featured.why}</p>
          {featured.wish.trim() && (
            <p className="projector-wish">
              <span className="wish-mark" aria-hidden>?</span> {featured.wish}
            </p>
          )}
          <footer>{featured.author ?? 'anonymous'}</footer>
        </article>
      )}
      <aside className="projector-qr">
        <QRCode value={submitUrl} size={132} bgColor="#FFFEFA" fgColor="#2B2823" aria-label={`QR code to add your note at ${submitUrl}`} />
        <p>Scan to pin your note</p>
      </aside>
      <a className="projector-exit" href="#/" aria-label="Exit projector mode">exit</a>
    </div>
  )
}
