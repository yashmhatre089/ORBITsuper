import { useState } from 'react'
import { update, useStore } from '../services/store'
import { addMemory } from '../services/memoryService'
import { Empty, form } from '../utils/ui'
export default function MemoryPage() {
  const s = useStore(), [q, setQ] = useState(''), L = s.memories.filter(m => (m.text + m.category).toLowerCase().includes(q.toLowerCase()))
  return (<><h1>Memory</h1><p className="m">Saved on this device. Relevant items are sent to Grok with your questions.</p><br />
    <form onSubmit={e => { const { d, f } = form(e); update(x => { addMemory(x, d.text, d.category, 'user') }); f.reset() }}><input name="text" placeholder="Remember…" required />
      <select name="category">{['Profile', 'Academic', 'Routine', 'Goals', 'Preferences'].map(c => <option key={c}>{c}</option>)}</select><button className="p">Save</button></form>
    <input placeholder="Search memory" value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
    <div className="c">{L.map(m => <div className="r" key={m.id}><span>{m.text} <span className="tag">{m.category}</span> <span className="tag">{m.source}</span></span><button onClick={() => update(x => { x.memories = x.memories.filter(k => k.id !== m.id) })}>✕</button></div>)}{!L.length && <Empty t="No memories." />}</div>
    {s.memories.length > 0 && <button onClick={() => { if (confirm('Clear all memories?')) update(x => { x.memories = [] }) }}>Clear all memories</button>}</>)
}
