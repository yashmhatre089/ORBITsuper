import type { Act, Mode, Snapshot, State } from '../types'
export const MODE_NAME: Record<Mode, string> = { run: 'RUNNING DAY', rest: 'NON-RUNNING DAY' }
export const today = (tz = 'Asia/Kolkata') => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
export const addDays = (d: string, n: number) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10) }
export const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
export const nowMin = (tz = 'Asia/Kolkata') => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':'); return Number(p[0]) * 60 + Number(p[1]) }
export const addMin = (t: string, m: number) => { const x = toMin(t) + m; return String(Math.floor(x / 60) % 24).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0') }
export function activeMode(s: State): Mode | undefined { const d = today(s.settings.timezone), sn = s.snapshots[d]; return sn?.manual ? sn.mode : s.selections[d]?.mode }
const makeSnap = (s: State, d: string, mode: Mode, manual: boolean): Snapshot => { const t = s.templates[mode]; return { date: d, mode, templateId: t.id, activities: JSON.parse(JSON.stringify(t.activities)), done: [], manual } }
export const needsSnapshot = (s: State) => { const m = activeMode(s); return !!m && s.snapshots[today(s.settings.timezone)]?.mode !== m }
export function ensureToday(s: State) { const m = activeMode(s), d = today(s.settings.timezone); if (m && s.snapshots[d]?.mode !== m) s.snapshots[d] = makeSnap(s, d, m, false) }
export const setSelection = (s: State, date: string, mode: Mode) => { s.selections[date] = { date, mode, selectedAt: new Date().toISOString() } }
export const setManual = (s: State, mode: Mode) => { const d = today(s.settings.timezone); s.snapshots[d] = makeSnap(s, d, mode, true) }
export function currentNext(acts: Act[], tz: string): [Act | undefined, Act | undefined] {
  const n = nowMin(tz), L = acts.filter(a => a.enabled).sort((a, b) => toMin(a.startTime) - toMin(b.startTime))
  return [L.find(a => toMin(a.startTime) <= n && n < toMin(a.endTime)), L.find(a => toMin(a.startTime) > n)]
}
