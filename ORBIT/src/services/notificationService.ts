import { getState, update } from './store'
import { addDays, nowMin, toMin, today } from './timetableService'
export const supported = () => typeof Notification !== 'undefined'
export const permission = () => (supported() ? Notification.permission : 'unsupported')
export const requestPermission = async () => (supported() ? Notification.requestPermission() : 'unsupported')
function fire(key: string, body: string) {
  if (getState().notified[key]) return
  update(x => { x.notified[key] = true })
  try { new Notification('ORBIT', { body }) } catch { /* unsupported context */ }
}
// Works only while the app is open. Closed-browser push needs a server scheduler.
export function startReminders() {
  const id = setInterval(() => {
    if (permission() !== 'granted') return
    const s = getState(), tz = s.settings.timezone, d = today(tz), n = nowMin(tz)
    if (n >= toMin(s.settings.planTime) && !s.selections[addDays(d, 1)]) fire('plan:' + d, 'Plan tomorrow’s routine.')
    s.snapshots[d]?.activities.filter(a => a.enabled && a.reminder && toMin(a.startTime) === n).forEach(a => fire(d + a.id, a.title + ' starts now'))
  }, 30000)
  return () => clearInterval(id)
}
