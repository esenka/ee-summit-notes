import { anchorLabel } from './anchors'
import type { Note } from './types'

const stamp = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportJSON(notes: Note[]) {
  download(
    `encoding-experiences-summit-notes-${stamp()}.json`,
    JSON.stringify(notes, null, 2),
    'application/json',
  )
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`

export function exportCSV(notes: Note[]) {
  const header = ['id', 'anchor_id', 'anchor_label', 'what', 'how', 'why', 'wish', 'methods', 'author', 'created_at']
  const rows = notes.map((n) =>
    [n.id, n.anchorId, anchorLabel(n.anchorId), n.what, n.how, n.why, n.wish, n.methods.join('; '), n.author ?? '', n.createdAt]
      .map(csvCell)
      .join(','),
  )
  download(
    `encoding-experiences-summit-notes-${stamp()}.csv`,
    [header.join(','), ...rows].join('\n'),
    'text/csv',
  )
}
