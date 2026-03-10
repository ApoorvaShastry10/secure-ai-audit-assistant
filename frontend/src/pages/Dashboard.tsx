import React, { useState } from 'react'
import { apiQuery, apiUploadDocument } from '../api'
import { getAccessToken, getUserRoles } from '../auth'

export default function Dashboard() {
  const [query, setQuery] = useState('What are the requirements for SOC 2 evidence retention?')
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<any[]>([])
  const [debug, setDebug] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const roles = getUserRoles()
  const isAdmin = roles.includes('admin')

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return
    setUploadBusy(true); setUploadError(null); setUploadMsg(null)
    try {
      const token = getAccessToken()
      if (!token) throw new Error('Please login first.')
      const res = await apiUploadDocument(token, uploadFile, uploadTitle || uploadFile.name)
      setUploadMsg(`Success! Document ID: ${res.doc_id}`)
      setUploadFile(null); setUploadTitle('')
      // reset file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (e: any) { setUploadError(e.message || 'Upload failed') }
    finally { setUploadBusy(false) }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {isAdmin && (
        <div className="card" style={{ borderLeft: '4px solid var(--accent)', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)' }}>
          <h4 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Secure Document Ingestion
          </h4>
          <form style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) auto', gap: 12, alignItems: 'center' }} onSubmit={handleUpload}>
            <input className="input" type="file" id="file-upload" onChange={e => setUploadFile(e.target.files?.[0] || null)} required style={{ padding: '8px 12px' }} />
            <input className="input" placeholder="Encryption Title (optional)" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} />
            <button className="btn primary" disabled={uploadBusy || !uploadFile} type="submit" style={{ whiteSpace: 'nowrap' }}>
              {uploadBusy ? 'Encrypting...' : 'Upload to Vault'}
            </button>
          </form>
          {uploadError && <div className="small" style={{ color: 'var(--danger)', marginTop: 12 }}>{uploadError}</div>}
          {uploadMsg && <div className="small" style={{ color: 'var(--success)', marginTop: 12, fontWeight: 500 }}>{uploadMsg}</div>}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Semantic Query Engine</h3>
        <textarea
          className="input"
          style={{ minHeight: 120, resize: 'vertical', lineHeight: 1.5 }}
          placeholder="Ask a question about your securely indexed documents..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
          <div className="row">
            <button className="btn primary" disabled={busy} onClick={async () => {
              setBusy(true); setError(null); setAnswer(''); setCitations([]); setDebug(null);
              try {
                const token = getAccessToken()
                if (!token) throw new Error('Please login first.')
                const res = await apiQuery(token, query)
                setAnswer(res.answer)
                setCitations(res.citations || [])
                setDebug(res.debug || null)
              } catch (e: any) { setError(e.message || 'Query failed') }
              finally { setBusy(false) }
            }}>
              {busy ? 'Running Inference...' : 'Execute Query'}
            </button>
            {busy && <div style={{ width: 16, height: 16, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          </div>
          {debug && (
            <div className="small" style={{ display: 'flex', gap: 16, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 6 }}>
              <span><span style={{ color: 'var(--text-muted)' }}>Vector Hits:</span> {debug.retrieved_total}</span>
              <span><span style={{ color: 'var(--text-muted)' }}>RBAC Authorized:</span> <span style={{ color: 'var(--success)', fontWeight: 600 }}>{debug.authorized_total}</span></span>
            </div>
          )}
        </div>
        {error && <div className="small" style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</div>}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>AI Synthesis</h3>
        {answer ? (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6, color: '#f8fafc' }}>{answer}</div>
          </div>
        ) : (
          <div className="small" style={{ fontStyle: 'italic', opacity: 0.5 }}>Waiting for semantic query execution...</div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Cryptographic Citations</h3>
        {citations.length === 0 ? <div className="small" style={{ opacity: 0.5 }}>No source documents verified.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Document Hash ID</th><th>Logical Title</th><th>Binary Source</th>{isAdmin && <th style={{ textAlign: 'right' }}>Controls</th>}</tr></thead>
              <tbody>
                {citations.map((c, i) => (
                  <tr key={i}>
                    <td><code>{c.doc_id.substring(0, 16)}...</code></td>
                    <td style={{ fontWeight: 500 }}>{c.title || '—'}</td>
                    <td>
                      {c.filename ? (
                        <a href="#" onClick={async (e) => {
                          e.preventDefault()
                          try {
                            const token = getAccessToken()
                            if (!token) return
                            const { apiDownloadDocument } = await import('../api')
                            await apiDownloadDocument(token, c.doc_id, c.filename)
                          } catch (err: any) { alert(err.message || 'Download failed') }
                        }} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          {c.filename}
                        </a>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn secondary" style={{ padding: '6px 12px', fontSize: 12, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={async () => {
                          if (!confirm(`Warning: This will cryptographically shred ${c.doc_id} from PostgreSQL, Neo4j, ChromaDB, and the file system. Proceed?`)) return
                          try {
                            const token = getAccessToken()
                            if (!token) return
                            const { apiDeleteDocument } = await import('../api')
                            await apiDeleteDocument(token, c.doc_id)
                            setCitations(prev => prev.filter(x => x.doc_id !== c.doc_id))
                          } catch (err: any) { alert(err.message || 'Delete failed') }
                        }}>
                          Shred Data
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
