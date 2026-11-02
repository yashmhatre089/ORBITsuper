import { createClient } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'
import type { State } from '../types'
import { applyRemote, getState, subscribe, update } from './store'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const syncConfigured = !!(url && key)
const sb = syncConfigured ? createClient(url!, key!) : null
export interface Status { state: 'off' | 'signedout' | 'syncing' | 'synced' | 'error'; email?: string; error?: string }
let st: Status = { state: syncConfigured ? 'signedout' : 'off' }
const ls = new Set<() => void>()
const set = (p: Partial<Status>) => { st = { ...st, ...p }; ls.forEach(f => f()) }
export const useSync = () => useSyncExternalStore(f => { ls.add(f); return () => { ls.delete(f) } }, () => st)
let uid: string | null = null, applying = false, lastSynced: string | undefined, timer: ReturnType<typeof setTimeout> | undefined

async function push() {
  if (!sb || !uid) return
  const s = getState(); set({ state: 'syncing', error: undefined })
  const { error } = await sb.from('orbit_state').upsert({ user_id: uid, data: s, updated_at: new Date().toISOString() })
  if (error) return set({ state: 'error', error: error.message })
  lastSynced = s.updatedAt; set({ state: 'synced' })
}
export async function syncNow() {
  if (!sb || !uid) return
  try {
    set({ state: 'syncing', error: undefined })
    const { data, error } = await sb.from('orbit_state').select('data').eq('user_id', uid).maybeSingle()
    if (error) throw error
    const remote = data?.data as State | undefined
    let local = getState()
    if (remote && remote.templates && (remote.updatedAt || '') > (local.updatedAt || '')) { applying = true; lastSynced = remote.updatedAt; applyRemote(remote); applying = false; set({ state: 'synced' }); return }
    if (!local.updatedAt) { applying = true; update(() => {}); applying = false; local = getState() }
    if (!remote || remote.updatedAt !== local.updatedAt) await push(); else { lastSynced = local.updatedAt; set({ state: 'synced' }) }
  } catch (e) { applying = false; set({ state: 'error', error: e instanceof Error ? e.message : 'Sync failed' }) }
}
// Whole-state, last-write-wins sync. Local edits push after 1.5s; remote is checked on sign-in and when the tab regains focus.
export function startSync() {
  if (!sb) return () => {}
  const unsub = subscribe(() => {
    if (!uid || applying || getState().updatedAt === lastSynced) return
    clearTimeout(timer); timer = setTimeout(() => { push() }, 1500)
  })
  const { data } = sb.auth.onAuthStateChange((_e, session) => {
    uid = session?.user.id ?? null
    set({ email: session?.user.email, state: uid ? 'syncing' : 'signedout', error: undefined })
    if (uid) syncNow()
  })
  const onVis = () => { if (uid && document.visibilityState === 'visible') syncNow() }
  document.addEventListener('visibilitychange', onVis)
  return () => { unsub(); data.subscription.unsubscribe(); document.removeEventListener('visibilitychange', onVis); clearTimeout(timer) }
}
export async function signIn(email: string, password: string) { if (!sb) return 'Supabase not configured.'; const { error } = await sb.auth.signInWithPassword({ email, password }); return error ? error.message : '' }
export async function signUp(email: string, password: string) { if (!sb) return 'Supabase not configured.'; const { data, error } = await sb.auth.signUp({ email, password }); return error ? error.message : data.session ? '' : 'Check your email to confirm, then sign in.' }
export async function signOut() { if (sb) await sb.auth.signOut() }
