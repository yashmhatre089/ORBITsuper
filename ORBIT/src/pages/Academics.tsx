import { update, useStore } from '../services/store'
import { Bar, Empty, form } from '../utils/ui'
import { uid } from '../utils/id'
export default function Academics() {
  const s = useStore()
  return (<><h1>Academics</h1><br />
    <form onSubmit={e => { const { d: v, f } = form(e); update(x => { x.subjects.push({ id: uid(), name: v.name, code: v.code, exam: v.exam, chapters: [] }) }); f.reset() }}>
      <input name="name" placeholder="Subject name" required /><input name="code" placeholder="Code" style={{ width: 100 }} /><input type="date" name="exam" /><button className="p">Add subject</button></form>
    {s.subjects.map(sub => { const p = sub.chapters.length ? Math.round(100 * sub.chapters.filter(c => c.done).length / sub.chapters.length) : 0
      return <div className="c" key={sub.id}><div className="r"><span><b>{sub.name}</b> <span className="tag">{sub.code}</span> {sub.exam && <span className="m">exam {sub.exam}</span>}</span><b>{p}%</b>
        <button onClick={() => { if (confirm('Delete subject?')) update(x => { x.subjects = x.subjects.filter(k => k.id !== sub.id) }) }}>✕</button></div><Bar v={p} />
        {sub.chapters.map(c => <div className="r" key={c.id}><input type="checkbox" checked={c.done} onChange={() => update(x => { const k = x.subjects.find(z => z.id === sub.id)?.chapters.find(z => z.id === c.id); if (k) k.done = !k.done })} />
          <span className={c.done ? 'd' : ''}>{c.name}</span><button onClick={() => update(x => { const k = x.subjects.find(z => z.id === sub.id); if (k) k.chapters = k.chapters.filter(z => z.id !== c.id) })}>✕</button></div>)}
        <form style={{ margin: '10px 0 0' }} onSubmit={e => { const { d: v, f } = form(e); update(x => { x.subjects.find(z => z.id === sub.id)?.chapters.push({ id: uid(), name: v.name, done: false }) }); f.reset() }}><input name="name" placeholder="Add chapter" required /><button>Add</button></form></div> })}
    {!s.subjects.length && <Empty t="No subjects yet." />}</>)
}
