import { NavLink } from 'react-router-dom'
const L: [string, string][] = [['/', 'Overview'], ['/timetables', 'Timetables'], ['/tasks', 'Tasks'], ['/study', 'Study'], ['/academics', 'Academics'], ['/memory', 'Memory'], ['/settings', 'Settings']]
export default function Nav() { return <nav><b>Orbit</b>{L.map(([p, t]) => <NavLink key={p} to={p} end={p === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>{t}</NavLink>)}</nav> }
