import { useState } from 'react'
import { update, useStore } from '../services/store'
import { addDays, today } from '../services/timetableService'
import { Empty, form } from '../utils/ui'
import { uid } from '../utils/id'
import type { Task } from '../types'
export default function Tasks() {
  const s = useStore(), [q, setQ] = useState(''), d = today(s.settings.timezone)
  const L = s.tasks.filter(t => t.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => Number(a.done) - Number(b.done) || (a.due || '9').localeCompare(b.due || '9'))
  const ed = (id: string, fn: (t: Task) => void) => update(x => { const t = x.tasks.find(k => k.id === id); if (t) fn(t) })
  return (<><h1>Tasks</h1><br />
    <form onSubmit={e => { const { d: v, f } = form(e); update(x => { x.tasks.push({ id: uid(), title: v.title, category: v.category, priority: v.priority as Task['priority'], due: v.due, done: false, createdAt: new Date().toISOString() }) }); f.reset() }}>
      <input name="title" placeholder="New task" required /><select name="category">{['Academic', 'Personal', 'Fitness', 'Projects', 'Other'].map(c => <option key={c}>{c}</option>)}</select>
      <select name="priority" defaultValue="med"><option value="high">High</option><option value="med">Medium</option><option value="low">Low</option></select><input type="date" name="due" /><button className="p">Add</button></form>
    <input placeholder="Search tasks" value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
    <div className="c">{L.map(t => { const o = !t.done && !!t.due && t.due < d; return <div className="r" key={t.id}>
      <input type="checkbox" checked={t.done} onChange={() => ed(t.id, k => { k.done = !k.done })} />
      <span className={t.done ? 'd' : o ? 'od' : ''}>{t.title} <span className="tag">{t.category}</span> <span className="tag">{t.priority}</span> {t.due && <span className="m">{t.due}</span>}{o && <b className="m od"> overdue</b>}</span>
      {o && <button onClick={() => ed(t.id, k => { k.due = addDays(d, 1) })}>Tomorrow</button>}<button onClick={() => update(x => { x.tasks = x.tasks.filter(k => k.id !== t.id) })}>✕</button></div> })}{!L.length && <Empty t="No tasks yet. Add one above." />}</div></>)
}
