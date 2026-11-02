import { update, useStore } from '../../services/store'
import { addDays, MODE_NAME, setManual, setSelection, today } from '../../services/timetableService'
import { CATS, form } from '../../utils/ui'
import { uid } from '../../utils/id'
import type { Act, Mode } from '../../types'
const T = /^\d\d:\d\d$/
export default function TemplateCard({ mode }: { mode: Mode }) {
  const s = useStore(), t = s.templates[mode], d = today(s.settings.timezone), tmr = addDays(d, 1)
  const edit = (fn: (a: Act[]) => void) => update(x => { fn(x.templates[mode].activities); x.templates[mode].updatedAt = new Date().toISOString() })
  const active = s.snapshots[d]?.mode === mode, tomorrow = s.selections[tmr]?.mode === mode
  const swap = (L: Act[], i: number, j: number) => { if (j >= 0 && j < L.length) { const k = L[i]; L[i] = L[j]; L[j] = k } }
  return (<div className="c">
    <div className="r"><h2 style={{ margin: 0, flex: 1 }}>{MODE_NAME[mode]}</h2>{active && <span className="tag">active today</span>}{tomorrow && <span className="tag">tomorrow</span>}</div>
    <div className="r"><button onClick={() => update(x => setManual(x, mode))}>Set as today’s</button><button onClick={() => update(x => setSelection(x, tmr, mode))}>Choose for tomorrow</button>
      <button onClick={() => { const o: Mode = mode === 'run' ? 'rest' : 'run'; if (confirm(`Replace ${MODE_NAME[o]} with a copy of ${MODE_NAME[mode]}?`)) update(x => { x.templates[o].activities = x.templates[mode].activities.map(a => ({ ...a, id: uid() })); x.templates[o].updatedAt = new Date().toISOString() }) }}>Copy to other</button></div>
    {t.activities.map((a, i) => <div className="r" key={a.id}>
      <input type="checkbox" title="Enabled" checked={a.enabled} onChange={() => edit(L => { L[i].enabled = !L[i].enabled })} />
      <span className={a.enabled ? '' : 'd'}>{a.startTime}–{a.endTime} {a.title} <span className="tag">{a.category}</span></span>
      <button title="Reminder" className={a.reminder ? 'p' : ''} onClick={() => edit(L => { L[i].reminder = !L[i].reminder })}>🔔</button>
      <button onClick={() => edit(L => swap(L, i, i - 1))}>↑</button><button onClick={() => edit(L => swap(L, i, i + 1))}>↓</button>
      <button onClick={() => { const v = prompt('Title | start | end', `${a.title} | ${a.startTime} | ${a.endTime}`); if (!v) return; const p = v.split('|').map(z => z.trim()); if (p[0] && T.test(p[1] || '') && T.test(p[2] || '') && p[2] > p[1]) edit(L => { L[i].title = p[0]; L[i].startTime = p[1]; L[i].endTime = p[2] }); else alert('Use: Title | HH:MM | HH:MM (end after start)') }}>Edit</button>
      <button onClick={() => edit(L => { L.splice(i, 1) })}>✕</button></div>)}
    <form style={{ marginTop: 10 }} onSubmit={e => { const { d: v, f } = form(e); if (v.endTime <= v.startTime) return alert('End must be after start.'); edit(L => { L.push({ id: uid(), title: v.title, category: v.category, startTime: v.startTime, endTime: v.endTime, enabled: true, reminder: !!v.reminder }) }); f.reset() }}>
      <input name="title" placeholder="Activity" required /><input type="time" name="startTime" required /><input type="time" name="endTime" required />
      <select name="category">{CATS.map(c => <option key={c}>{c}</option>)}</select><label className="m"><input type="checkbox" name="reminder" /> 🔔</label><button className="p">Add</button></form>
  </div>)
}
