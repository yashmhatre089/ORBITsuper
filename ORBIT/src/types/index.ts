export type Mode = 'run' | 'rest'
export interface Act { id: string; title: string; category: string; startTime: string; endTime: string; enabled: boolean; reminder: boolean }
export interface Template { id: string; name: string; mode: Mode; activities: Act[]; createdAt: string; updatedAt: string }
export interface Selection { date: string; mode: Mode; selectedAt: string }
export interface Snapshot { date: string; mode: Mode; templateId: string; activities: Act[]; done: string[]; manual: boolean }
export interface Task { id: string; title: string; category: string; priority: 'high' | 'med' | 'low'; due: string; done: boolean; createdAt: string }
export interface Chapter { id: string; name: string; done: boolean }
export interface Subject { id: string; name: string; code: string; exam: string; chapters: Chapter[] }
export interface Session { id: string; subjectId: string; date: string; time: string; minutes: number; done: boolean }
export interface Memory { id: string; text: string; category: string; source: 'user' | 'app'; createdAt: string }
export interface Msg { role: 'user' | 'assistant'; content: string }
export interface State {
  version: number; templates: Record<Mode, Template>; selections: Record<string, Selection>; snapshots: Record<string, Snapshot>
  tasks: Task[]; subjects: Subject[]; sessions: Session[]; memories: Memory[]; chat: Msg[]
  settings: { planTime: string; timezone: string }; notified: Record<string, true>; updatedAt?: string
}
