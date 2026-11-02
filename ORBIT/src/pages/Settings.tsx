import { getState, replaceState, seed, update, useStore } from '../services/store'
import { permission, requestPermission } from '../services/notificationService'
import { form } from '../utils/ui'
import { useState } from 'react'
import { signIn, signOut, signUp, syncNow, useSync } from '../services/syncService'
export default function Settings() {
  const s = useStore(), sy = useSync(), [msg, setMsg] = useState('')
  const run = async (f: HTMLFormElement, up: boolean) => { const d = Object.fromEntries(new FormData(f)) as Record<string, string>; setMsg('Working…'); setMsg(await (up ? signUp : signIn)(d.email, d.password)) }
  const exportJson = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' })); a.download = 'orbit-backup.json'; a.click() }
  const importJson = async (f?: File) => { if (!f) return; try { const j = JSON.parse(await f.text()); if (confirm('Replace current data with this backup?')) replaceState(j) } catch { alert('Invalid backup file.') } }
  return (<><h1>Settings</h1><br />
    <div className="c"><h2>Cloud sync</h2>
      {sy.state === 'off' ? <p className="m">Supabase isn’t configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild.</p>
        : sy.state === 'signedout' ? <form onSubmit={e => { e.preventDefault(); run(e.currentTarget, false) }}><input type="email" name="email" placeholder="Email" required /><input type="password" name="password" placeholder="Password (6+ chars)" minLength={6} required /><button className="p">Sign in</button><button type="button" onClick={e => { const f = e.currentTarget.form; if (f && f.reportValidity()) run(f, true) }}>Create account</button></form>
          : <><p className="m">Signed in as {sy.email} · {sy.state === 'synced' ? 'all changes synced' : sy.state === 'syncing' ? 'syncing…' : 'sync error'}{sy.error ? ': ' + sy.error : ''}</p><button onClick={() => { syncNow() }}>Sync now</button> <button onClick={() => { signOut() }}>Sign out</button></>}
      {msg && <p className="m">{msg}</p>}<p className="m">The whole app state syncs as one record; if two devices edit at once, the latest edit wins.</p></div>
    <div className="c"><h2>Planning reminder</h2><p className="m">Timezone: {s.settings.timezone} · Notifications: {permission()}</p>
      <form onSubmit={e => { const { d } = form(e); update(x => { x.settings.planTime = d.planTime }) }}><input type="time" name="planTime" defaultValue={s.settings.planTime} required /><button className="p">Save time</button><button type="button" onClick={() => { requestPermission().then(() => update(() => {})) }}>Enable notifications</button></form>
      <p className="m">Reminders fire while ORBIT is open. Closed-browser push needs a server scheduler (not included).</p></div>
    <div className="c"><h2>Data</h2><button onClick={exportJson}>Export JSON</button> <label className="m">Import: <input type="file" accept="application/json" onChange={e => importJson(e.target.files?.[0])} /></label><br /><br />
      <button onClick={() => { if (confirm('Delete ALL ORBIT data on this device?')) replaceState(seed()) }}>Clear all data</button></div></>)
}
