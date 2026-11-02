import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Nav from './components/Navigation/Nav'
import FloatingAssistant from './components/FloatingAssistant/FloatingAssistant'
import Dashboard from './pages/Dashboard'
import Timetables from './pages/Timetables'
import Tasks from './pages/Tasks'
import Study from './pages/Study'
import Academics from './pages/Academics'
import MemoryPage from './pages/MemoryPage'
import Settings from './pages/Settings'
import { getState, update, useStore } from './services/store'
import { ensureToday, needsSnapshot } from './services/timetableService'
import { startReminders } from './services/notificationService'
import { startSync } from './services/syncService'
export default function App() {
  useStore()
  useEffect(() => {
    const sync = () => { if (needsSnapshot(getState())) update(ensureToday) }
    sync(); const t = setInterval(sync, 60000); const stop = startReminders(), stopSync = startSync()
    return () => { clearInterval(t); stop(); stopSync() }
  }, [])
  return (<><Nav /><main>
    <Routes>
      <Route path="/" element={<Dashboard />} /><Route path="/timetables" element={<Timetables />} /><Route path="/tasks" element={<Tasks />} />
      <Route path="/study" element={<Study />} /><Route path="/academics" element={<Academics />} /><Route path="/memory" element={<MemoryPage />} />
      <Route path="/settings" element={<Settings />} /><Route path="*" element={<Navigate to="/" replace />} />
    </Routes></main><FloatingAssistant /></>)
}
