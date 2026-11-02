import TemplateCard from '../components/Timetable/TemplateCard'
import { useStore } from '../services/store'
import { activeMode, addDays, MODE_NAME, today } from '../services/timetableService'
export default function Timetables() {
  const s = useStore(), m = activeMode(s), t = s.selections[addDays(today(s.settings.timezone), 1)]
  return (<><h1>My timetables</h1><p className="m">Today: <b>{m ? MODE_NAME[m] : 'not set'}</b> · Tomorrow: <b>{t ? MODE_NAME[t.mode] : 'not chosen'}</b></p><br /><div className="g"><TemplateCard mode="run" /><TemplateCard mode="rest" /></div></>)
}
