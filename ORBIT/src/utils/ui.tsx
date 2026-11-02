import type { FormEvent } from 'react'
export const Bar = ({ v }: { v: number }) => <div className="bar"><i style={{ width: Math.max(0, Math.min(100, v)) + '%' }} /></div>
export const Empty = ({ t }: { t: string }) => <p className="m">{t}</p>
export function form(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = e.currentTarget; return { d: Object.fromEntries(new FormData(f)) as Record<string, string>, f } }
export const CATS = ['Personal', 'Study', 'College', 'Fitness', 'Meal', 'Travel']
