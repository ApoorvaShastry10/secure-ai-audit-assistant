import React, { useEffect, useState } from 'react'
import { apiAuditLogs, apiVerifyAudit } from '../api'
import { getAccessToken } from '../auth'

export default function AuditLogs() {
  const [rows, setRows] = useState<any[]>([])
  const [verify, setVerify] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    try {
      const token = getAccessToken()
      if (!token) throw new Error('Please login first.')
      setRows(await apiAuditLogs(token))
    } catch (e:any) { setError(e.message || 'Failed') }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h3 style={{marginTop:0}}>Audit Logs</h3>
        <div className="row">
          <button className="btn secondary" onClick={load}>Refresh</button>
          <button className="btn" onClick={async () => {
            setError(null)
            try {
              const token = getAccessToken()
              if (!token) throw new Error('Please login first.')
              setVerify(await apiVerifyAudit(token))
            } catch (e:any) { setError(e.message || 'Verify failed') }
          }}>Verify chain</button>
        </div>
      </div>

      {verify && <div className="small" style={{marginBottom:10}}>
        Verification: <b>{verify.ok ? 'OK' : 'FAIL'}</b> • checked {verify.checked}
        {!verify.ok && <> • mismatch at {verify.mismatch_at_log_id} ({verify.reason})</>}
      </div>}
      {error && <div className="small" style={{color:'crimson', marginBottom:10}}>{error}</div>}

      <table className="table">
        <thead><tr><th>ID</th><th>Time</th><th>Action</th><th>Outcome</th><th>Resources</th><th>Hashes</th></tr></thead>
        <tbody>
          {rows.map((r:any) => (
            <tr key={r.log_id}>
              <td>{r.log_id}</td>
              <td><span className="small">{r.timestamp_utc}</span></td>
              <td>{r.action}</td>
              <td><span className="badge">{r.outcome}</span></td>
              <td><span className="small">{(r.resource_ids||[]).join(', ')}</span></td>
              <td><span className="small">prev {r.hash_prev.slice(0,10)}…<br/>curr {r.hash_curr.slice(0,10)}…</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="small" style={{marginTop:10}}>Admin-only.</div>
    </div>
  )
}
