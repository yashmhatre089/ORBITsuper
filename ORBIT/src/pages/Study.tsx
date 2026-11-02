import { update, useStore } from '../services/store'
import { addDays, addMin, toMin, today } from '../services/timetableService'
import { Empty, form } from '../utils/ui'
import { uid } from '../utils/id'
export default function Study() {
  const s = useStore(), d = today(s.settings.timezone), w = addDays(d, -6), name = (id: string) => s.subjects.find(x => x.id === id)?.name ?? '—'
  return (<><h1>Study</h1><br />
    {s.subjects.length ? <form onSubmit={e => { const { d: v, f } = form(e); const st = toMin(v.time), en = st + Number(v.minutes)
      if (s.sessions.some(x => x.date === v.date && st < toMin(x.time) + x.minutes && en > toMin(x.time))) return alert('Overlaps another session.')
      update(x => { x.sessions.push({ id: uid(), subjectId: v.subjectId, date: v.date, time: v.time, minutes: Number(v.minutes), done: false }) }); f.reset() }}>
      <select name="subjectId">{s.subjects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select><input type="date" name="date" defaultValue={d} required /><input type="time" name="time" required />
      <input type="number" name="minutes" defaultValue={45} min={5} step={5} style={{ width: 80 }} /><button className="p">Add session</button></form> : <Empty t="Add a subject in Academics first." />}
    <div className="c"><div className="m">Last 7 days: {s.sessions.filter(x => x.done && x.date >= w).reduce((n, x) => n + x.minutes, 0)} min studied</div>
      {[...s.sessions].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(x => <div className="r" key={x.id}>
        <input type="checkbox" checked={x.done} onChange={() => update(y => { const k = y.sessions.find(z => z.id === x.id); if (k) k.done = !k.done })} />
        <span className={x.done ? 'd' : ''}>{x.date} {x.time}–{addMin(x.time, x.minutes)} · {name(x.subjectId)} · {x.minutes} min</span><button onClick={() => update(y => { y.sessions = y.sessions.filter(z => z.id !== x.id) })}>✕</button></div>)}
      {!s.sessions.length && <Empty t="No sessions yet." />}</div></>)
}
