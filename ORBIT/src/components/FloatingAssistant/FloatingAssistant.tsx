import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getState, update, useStore } from '../../services/store'
import { applyProposal, askGrok, describe, parseProposal, type Proposal } from '../../services/aiService'
import { handleMemoryCommand } from '../../services/memoryService'
export default function FloatingAssistant() {
  const s = useStore(), [open, setOpen] = useState(false), [text, setText] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [prop, setProp] = useState<Proposal>()
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView() }, [s.chat.length, open, busy, prop])
  async function send(e: FormEvent) {
    e.preventDefault(); const q = text.trim(); if (!q || busy) return
    setText(''); setErr(''); setProp(undefined)
    const prior = getState().chat
    update(x => { x.chat.push({ role: 'user', content: q }) })
    const mem = handleMemoryCommand(q)
    if (mem) { update(x => { x.chat.push({ role: 'assistant', content: mem }) }); return }
    setBusy(true)
    try { const { text: t, proposal } = parseProposal(await askGrok(getState(), prior, q)); update(x => { x.chat.push({ role: 'assistant', content: t }) }); setProp(proposal) }
    catch (ex) { setErr(ex instanceof Error ? ex.message : 'Grok is unavailable.') } finally { setBusy(false) }
  }
  return (<>
    <button id="fb" aria-label="ORBIT AI" onClick={() => setOpen(!open)}>◉</button>
    {open && <div id="fp">
      <div className="r" style={{ padding: '10px 12px' }}><b style={{ flex: 1 }}>ORBIT AI</b><button onClick={() => setOpen(false)} aria-label="Close">✕</button></div>
      <div className="fb-body">
        {!s.chat.length && <p className="m">Ask about today, tomorrow, your tasks or your studies.</p>}
        {s.chat.map((m, i) => <div className="msg" key={i}><b>{m.role === 'user' ? 'You' : 'ORBIT'}</b><span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span></div>)}
        {busy && <p className="m">Thinking…</p>}{err && <p className="od">{err}</p>}
        {prop && <div className="c"><p>{describe(prop)}?</p><button className="p" onClick={() => { update(x => applyProposal(x, prop)); setProp(undefined) }}>Apply</button> <button onClick={() => setProp(undefined)}>Dismiss</button></div>}
        <div ref={end} />
      </div>
      <form onSubmit={send}><input value={text} onChange={e => setText(e.target.value)} placeholder="Message ORBIT…" autoComplete="off" /><button className="p" disabled={busy}>Send</button></form>
    </div>}
  </>)
}
