import { Scene } from '../scene/Scene'
import { useApp } from '../store'
import { AnchorSheet } from '../ui/AnchorSheet'
import { Header } from '../ui/Header'
import { NoteModal } from '../ui/NoteModal'
import { NotesPanel } from '../ui/NotesPanel'

export function Home() {
  const panelOpen = useApp((s) => s.panelOpen)
  const loading = useApp((s) => s.loading)

  return (
    <div className="home">
      <Header />
      <main className="stage">
        <Scene />
        {loading && <p className="loading">Loading notes…</p>}
        <p className="stage-hint">Click a glowing dot on the body or in the room to read and leave notes.</p>
        <AnchorSheet />
        {panelOpen && <NotesPanel />}
      </main>
      <NoteModal />
    </div>
  )
}
