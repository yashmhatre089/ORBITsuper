import { useSyncExternalStore } from 'react'
import type { Act, State } from '../types'
const KEY = 'orbit.v2'
const mk = (p: string, l: string[][]): Act[] => l.map((x, i) => ({ id: p + i, title: x[0], category: x[1], startTime: x[2], endTime: x[3], enabled: true, reminder: false }))
const now = () => new Date().toISOString()
export const seed = (): State => ({
  version: 2, selections: {}, snapshots: {}, tasks: [], subjects: [], sessions: [], memories: [], chat: [], notified: {},
  settings: { planTime: '20:30', timezone: 'Asia/Kolkata' },
  templates: {
    run: { id: 'tpl-run', name: 'Running day', mode: 'run', createdAt: now(), updatedAt: now(), activities: mk('r', [['Wake up', 'Personal', '06:00', '06:15'], ['Study', 'Study', '06:30', '07:30'], ['College', 'College', '08:30', '16:00'], ['Running', 'Fitness', '18:30', '19:30'], ['Dinner', 'Meal', '20:00', '20:30'], ['Revision', 'Study', '20:30', '22:00'], ['Sleep', 'Personal', '22:30', '23:59']]) },
    rest: { id: 'tpl-rest', name: 'Non-running day', mode: 'rest', createdAt: now(), updatedAt: now(), activities: mk('n', [['Wake up', 'Personal', '06:30', '06:45'], ['Study', 'Study', '07:00', '08:00'], ['College', 'College', '08:30', '16:00'], ['Gym', 'Fitness', '17:00', '18:00'], ['Dinner', 'Meal', '20:00', '20:30'], ['Revision', 'Study', '20:30', '22:00'], ['Sleep', 'Personal', '22:30', '23:59']]) },
  },
})
function load(): State { try { return { ...seed(), ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return seed() } }
let S: State = load()
const subs = new Set<() => void>()
export const getState = () => S
function commit(n: State) {
  S = n
  try { localStorage.setItem(KEY, JSON.stringify(S)) } catch { /* storage full or blocked */ }
  subs.forEach(f => f())
}
export function update(fn: (s: State) => void) { const n: State = JSON.parse(JSON.stringify(S)); fn(n); n.chat = n.chat.slice(-60); n.updatedAt = new Date().toISOString(); commit(n) }
export const replaceState = (s: Partial<State>) => commit({ ...seed(), ...s, updatedAt: new Date().toISOString() })
export const applyRemote = (s: State) => commit({ ...seed(), ...s })
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
export const useStore = () => useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f) } }, () => S)
