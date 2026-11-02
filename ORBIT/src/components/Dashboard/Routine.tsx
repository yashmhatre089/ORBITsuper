import { useEffect, useState } from 'react'
import { update, useStore } from '../../services/store'
import { addDays, currentNext, MODE_NAME, nowMin, setManual, setSelection, toMin, today } from '../../services/timetableService'
import { Bar } from '../../utils/ui'
import type { Act, Mode } from '../../types'
export default function Routine() {
  const s = useStore(), [, tick] = useState(0)
  useEffect(() => { const i = setInterval(() => tick(n => n + 1), 30000); return () => clearInterval(i) }, [])
  const tz = s.settings.timezone, d = today(tz), tmr = addDays(d, 1), snap = s.snapshots[d], sel = s.selections[tmr]
  const choose = (m: Mode) => update(x => setSelection(x, tmr, m)), modes: Mode[] = ['run', 'rest']
  const prompt = !sel && nowMin(tz) >= toMin(s.settings.planTime)
  const L = snap ? snap.activities.filter(a => a.enabled) : [], dn = snap ? L.filter(a => snap.done.includes(a.id)).length : 0, pc = L.length ? Math.round(100 * dn / L.length) : 0
  const [cu, nx]: [Act | undefined, Act | undefined] = snap ? currentNext(snap.activities, tz) : [undefined, undefined]
  return (<>
    {prompt && <div className="c"><h2>Are you planning to run tomorrow?</h2><button className="p" onClick={() => choose('run')}>YES, RUNNING DAY</button> <button onClick={() => choose('rest')}>NO, REST / NON-RUNNING DAY</button></div>}
    {sel && <p className="m">Tomorrow ({tmr}): <b>{MODE_NAME[sel.mode]}</b></p>}
    {!snap ? <div className="c"><h2>Today’s routine</h2><p>You haven’t selected tomorrow’s routine yet.</p>{modes.map(m => <button key={m} className={m === 'run' ? 'p' : ''} onClick={() => update(x => setManual(x, m))}>Use {MODE_NAME[m].toLowerCase()} today</button>)}</div> :
      <div className="c">
        <div className="r"><h2 style={{ margin: 0, flex: 1 }}>Today’s routine</h2><span className="tag">{MODE_NAME[snap.mode]}</span></div>
        <p className="m">{d} · {snap.manual ? 'switched manually' : 'planned last night'} · now: {cu ? cu.title : 'free'} · next: {nx ? `${nx.startTime} ${nx.title}` : 'none'} · {dn}/{L.length} done ({pc}%)</p><Bar v={pc} />
        {L.map(a => <div className="r" key={a.id}><input type="checkbox" checked={snap.done.includes(a.id)} onChange={() => update(x => { const p = x.snapshots[d]; p.done = p.done.includes(a.id) ? p.done.filter(k => k !== a.id) : [...p.done, a.id] })} /><span className={snap.done.includes(a.id) ? 'd' : ''}>{a.startTime}–{a.endTime} {a.title} <span className="tag">{a.category}</span></span></div>)}
        <p className="m">Switch today only (saved templates stay unchanged):</p>{modes.map(m => <button key={m} className={m === snap.mode ? 'p' : ''} onClick={() => update(x => setManual(x, m))}>{MODE_NAME[m]}</button>)}
      </div>}
  </>)
}
