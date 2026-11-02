import type { State } from '../types'
import { update } from './store'
import { uid } from '../utils/id'
export function addMemory(s: State, text: string, category = 'Preferences', source: 'user' | 'app' = 'user') {
  const t = text.trim(); if (!t || s.memories.some(m => m.text.toLowerCase() === t.toLowerCase())) return false
  s.memories.push({ id: uid(), text: t, category, source, createdAt: new Date().toISOString() }); return true
}
const guess = (t: string) => /study|exam|subject|marks|chapter/i.test(t) ? 'Academic' : /wake|sleep|college|gym|run/i.test(t) ? 'Routine' : /goal|want to/i.test(t) ? 'Goals' : 'Preferences'
export function handleMemoryCommand(q: string): string | null {
  const r = q.match(/^remember(?: that)?\s+(.+)/i)
  if (r) { const box = { ok: false }; update(s => { box.ok = addMemory(s, r[1], guess(r[1])) }); return box.ok ? 'Saved to memory.' : 'Already in memory.' }
  const f = q.match(/^forget\s+(.+)/i)
  if (f) { const k = f[1].toLowerCase(), box = { n: 0 }; update(s => { const b = s.memories.length; s.memories = s.memories.filter(m => !m.text.toLowerCase().includes(k)); box.n = b - s.memories.length }); return `Removed ${box.n} memor${box.n === 1 ? 'y' : 'ies'}.` }
  return null
}
export function relevantMemories(s: State, q: string, max = 8) {
  const w = q.toLowerCase().split(/\W+/).filter(x => x.length > 3)
  return s.memories.filter(m => m.category === 'Profile' || w.some(x => m.text.toLowerCase().includes(x))).slice(0, max).map(m => ({ text: m.text, category: m.category, confirmedByUser: m.source === 'user' }))
}
