import React, { useState } from 'react'
import { apiQuery } from '../api'
import { getAccessToken } from '../auth'

export default function Dashboard() {
  const [query, setQuery] = useState('What are the requirements for SOC 2 evidence retention?')
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<any[]>([])
  const [debug, setDebug] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div style={{display:'grid', gap: 12}}>
      <div className="card">
        <h3 style={{marginTop:0}}>Query</h3>
        <textarea className="input" style={{minHeight: 90}} value={query} onChange={e => setQuery(e.target.value)} />
        <div className="row" style={{marginTop: 10}}>
          <button className="btn" disabled={busy} onClick={async () => {
            setBusy(true); setError(null)
            try {
              const token = getAccessToken()
              if (!token) throw new Error('Please login first.')
              const res = await apiQuery(token, query)
              setAnswer(res.answer)
              setCitations(res.citations || [])
              setDebug(res.debug || null)
            } catch (e:any) { setError(e.message || 'Query failed') }
            finally { setBusy(false) }
          }}>{busy ? 'Running…' : 'Run query'}</button>
          {debug && <span className="small">Retrieved: {debug.retrieved_total} • Authorized: {debug.authorized_total}</span>}
        </div>
        {error && <div className="small" style={{color:'crimson', marginTop:10}}>{error}</div>}
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>Answer</h3>
        <pre style={{whiteSpace:'pre-wrap', margin:0}}>{answer || '—'}</pre>
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>Citations</h3>
        {citations.length === 0 ? <div className="small">—</div> : (
          <table className="table">
            <thead><tr><th>Doc</th><th>Chunk</th><th>Title</th><th>File</th></tr></thead>
            <tbody>
              {citations.map((c, i) => (
                <tr key={i}>
                  <td><code>{c.doc_id}</code></td>
                  <td>#{c.chunk_index}</td>
                  <td>{c.title || '—'}</td>
                  <td>{c.filename || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
