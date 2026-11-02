import type { Mode, Msg, State } from '../types'
import { activeMode, addDays, MODE_NAME, nowMin, today } from './timetableService'
import { relevantMemories } from './memoryService'
import { uid } from '../utils/id'
export type Proposal = { type: 'set_tomorrow'; mode: Mode } | { type: 'add_task'; title: string; due?: string }
export function buildContext(s: State, q: string) {
  const tz = s.settings.timezone, d = today(tz), tm = addDays(d, 1), n = nowMin(tz)
  const snap = s.snapshots[d], sel = s.selections[tm], m = activeMode(s)
  const sched = /schedul|routine|timetable|run|rest|tomorrow|today|plan|hour|extend|time/i.test(q)
  const acad = /study|exam|subject|chapter|syllabus|behind|academ|revis|nlp|focus|prior/i.test(q)
  const ctx: Record<string, unknown> = {
    nowIST: `${d} ${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`, timezone: tz,
    todayRoutine: snap ? { mode: m ? MODE_NAME[m] : null, manualOverride: snap.manual, activities: snap.activities.filter(a => a.enabled).map(a => ({ title: a.title, category: a.category, start: a.startTime, end: a.endTime, completed: snap.done.includes(a.id) })) } : 'No routine active today',
    tomorrowPlan: sel ? { date: tm, mode: MODE_NAME[sel.mode] } : `Not chosen yet for ${tm}`,
    pendingTasks: s.tasks.filter(t => !t.done).slice(0, 15).map(t => ({ title: t.title, priority: t.priority, due: t.due || null, overdue: !!t.due && t.due < d })),
    memories: relevantMemories(s, q),
  }
  if (sched) ctx.templates = { running: s.templates.run.activities.filter(a => a.enabled), nonRunning: s.templates.rest.activities.filter(a => a.enabled) }
  if (acad) { ctx.subjects = s.subjects.map(x => ({ name: x.name, exam: x.exam || null, chapters: x.chapters.length, completed: x.chapters.filter(c => c.done).length, pending: x.chapters.filter(c => !c.done).map(c => c.name) })); ctx.upcomingStudySessions = s.sessions.filter(x => !x.done && x.date >= d).slice(0, 10) }
  return ctx
}
export async function askGrok(s: State, history: Msg[], q: string): Promise<string> {
  let r: Response
  try { r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...history.slice(-10), { role: 'user', content: q }], context: buildContext(s, q) }) }) }
  catch { throw new Error('Network error. Check your connection.') }
  const j: { error?: string; reply?: string } = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status}). If running locally, use "npx vercel dev" so /api works.`)
  return String(j.reply)
}
export function parseProposal(text: string): { text: string; proposal?: Proposal } {
  const m = text.match(/```action\s*([\s\S]*?)```/); if (!m) return { text }
  const clean = text.replace(m[0], '').trim()
  try {
    const p = JSON.parse(m[1])
    if (p.type === 'set_tomorrow' && (p.mode === 'run' || p.mode === 'rest')) return { text: clean, proposal: { type: 'set_tomorrow', mode: p.mode } }
    if (p.type === 'add_task' && typeof p.title === 'string') return { text: clean, proposal: { type: 'add_task', title: p.title.slice(0, 200), due: /^\d{4}-\d\d-\d\d$/.test(p.due || '') ? p.due : undefined } }
  } catch { /* ignore malformed block */ }
  return { text: clean }
}
export function applyProposal(s: State, p: Proposal) {
  if (p.type === 'set_tomorrow') { const d = addDays(today(s.settings.timezone), 1); s.selections[d] = { date: d, mode: p.mode, selectedAt: new Date().toISOString() } }
  else s.tasks.push({ id: uid(), title: p.title, category: 'Other', priority: 'med', due: p.due || '', done: false, createdAt: new Date().toISOString() })
}
export const describe = (p: Proposal) => p.type === 'set_tomorrow' ? `Set tomorrow to ${MODE_NAME[p.mode]}` : `Add task “${p.title}”${p.due ? ' due ' + p.due : ''}`
