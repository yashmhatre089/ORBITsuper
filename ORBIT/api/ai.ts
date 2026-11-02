const SYSTEM = `You are ORBIT AI, the user's personal productivity, academic and daily-planning advisor. Be direct, analytical and practical. Use ONLY the ORBIT DATA provided; never invent personal or academic facts, and say what information is missing. Keep today's routine, tomorrow's planned routine, the Running template and the Non-running template distinct. Never claim to have changed anything. When the user asks to change tomorrow's mode or add a task, describe it and append exactly one block: \`\`\`action {"type":"set_tomorrow","mode":"run"|"rest"} \`\`\` or \`\`\`action {"type":"add_task","title":"...","due":"YYYY-MM-DD"} \`\`\`. The user must approve it in the UI.`
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.XAI_API_KEY, model = process.env.XAI_MODEL
  if (!key || !model) return res.status(500).json({ error: 'Server is missing XAI_API_KEY or XAI_MODEL.' })
  const { messages, context } = req.body || {}
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'messages required' })
  const data = JSON.stringify(context ?? {}).slice(0, 14000)
  try {
    const r = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, temperature: 0.4, messages: [{ role: 'system', content: `${SYSTEM}\n\nORBIT DATA:\n${data}` }, ...messages.slice(-12).map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 4000) }))] }),
    })
    const j: any = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: r.status === 429 ? 'Rate limit or credits exhausted.' : r.status === 401 ? 'Invalid xAI API key.' : j?.error?.message || (typeof j?.error === 'string' ? j.error : 'xAI request failed.') })
    const reply = j?.choices?.[0]?.message?.content
    if (!reply) return res.status(502).json({ error: 'Unexpected response from xAI.' })
    return res.status(200).json({ reply })
  } catch { return res.status(502).json({ error: 'Network error reaching xAI.' }) }
}
