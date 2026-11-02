import Routine from '../components/Dashboard/Routine'
import { useStore } from '../services/store'
import { nowMin, today } from '../services/timetableService'
import { Empty } from '../utils/ui'
const W = { high: 0, med: 1, low: 2 }
type Row = [string, string, string]
export default function Dashboard() {
  const s = useStore(), tz = s.settings.timezone, d = today(tz), h = Math.floor(nowMin(tz) / 60)
  const pend = s.tasks.filter(t => !t.done), over = pend.filter(t => t.due && t.due < d), hrs = s.sessions.filter(x => x.done).reduce((n, x) => n + x.minutes, 0) / 60
  const top = [...pend].sort((a, b) => W[a.priority] - W[b.priority] || (a.due || '9').localeCompare(b.due || '9')).slice(0, 3)
  const up: Row[] = [...pend.filter(t => t.due && t.due >= d).map((t): Row => [t.due, t.title, 'Task']), ...s.subjects.filter(x => x.exam && x.exam >= d).map((x): Row => [x.exam, x.name, 'Exam'])].sort().slice(0, 5)
  const stats: [string, string | number][] = [['Tasks', s.tasks.length], ['Done', s.tasks.length - pend.length], ['Pending', pend.length], ['Overdue', over.length], ['Study hrs', hrs.toFixed(1)]]
  return (<>
    <p className="m">{new Date(d + 'T12:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}</p>
    <h1>{h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}.</h1><p className="m">Your life. Connected intelligently.</p><br />
    <div className="g st">{stats.map(([k, v]) => <div className="c" key={k}><div className="n">{v}</div><div className="m">{k}</div></div>)}</div>
    <Routine />
    <div className="g"><div className="c"><h2>Priority tasks</h2>{top.map(t => <div className="r" key={t.id}><span className={t.due && t.due < d ? 'od' : ''}>{t.title}</span><span className="tag">{t.priority}</span></div>)}{!top.length && <Empty t="No pending tasks." />}</div>
      <div className="c"><h2>Upcoming</h2>{up.map((x, i) => <div className="r" key={i}><span>{x[1]}</span><span className="tag">{x[2]} · {x[0]}</span></div>)}{!up.length && <Empty t="No deadlines." />}</div></div>
    <p className="m">Tap the ◉ button for ORBIT AI.</p></>)
}
