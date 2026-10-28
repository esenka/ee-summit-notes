import { useEffect, useState } from 'react'
import { Admin } from './pages/Admin'
import { Home } from './pages/Home'
import { Projector } from './pages/Projector'
import { Submit } from './pages/Submit'
import { useApp } from './store'

/** Tiny hash router: #/ (scene), #/submit, #/projector, #/admin. */
function useRoute(): string {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash.replace(/^#/, '') || '/'
}

export default function App() {
  const route = useRoute()

  // Load notes and keep them live for every page.
  useEffect(() => useApp.getState().init(), [])

  if (route.startsWith('/submit')) return <Submit />
  if (route.startsWith('/projector')) return <Projector />
  if (route.startsWith('/admin')) return <Admin />
  return <Home />
}
