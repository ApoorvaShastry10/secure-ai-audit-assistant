import React, { useEffect, useState } from 'react'
import { apiUsers, apiPolicies } from '../api'
import { getAccessToken } from '../auth'

export default function Admin() {
  const [users, setUsers] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    try {
      const token = getAccessToken()
      if (!token) throw new Error('Please login first.')
      const [u, p] = await Promise.all([apiUsers(token), apiPolicies(token)])
      setUsers(u); setPolicies(p)
    } catch (e:any) { setError(e.message || 'Failed') }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{display:'grid', gap: 12}}>
      <div className="card">
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3 style={{marginTop:0}}>Admin</h3>
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>
        {error && <div className="small" style={{color:'crimson'}}>{error}</div>}
        <div className="small">Minimal admin view for local dev.</div>
      </div>

      <div className="card">
        <h4 style={{marginTop:0}}>Users</h4>
        <table className="table">
          <thead><tr><th>Email</th><th>Roles</th><th>Active</th><th>ID</th></tr></thead>
          <tbody>
            {users.map((u:any) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td><span className="small">{(u.roles||[]).join(', ')}</span></td>
                <td>{u.is_active ? 'yes' : 'no'}</td>
                <td><span className="small"><code>{u.id}</code></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h4 style={{marginTop:0}}>Policies</h4>
        <table className="table">
          <thead><tr><th>Role</th><th>Doc</th><th>Perm</th><th>ID</th></tr></thead>
          <tbody>
            {policies.map((p:any) => (
              <tr key={p.id}>
                <td>{p.role_name}</td>
                <td><span className="small"><code>{p.doc_id}</code></span></td>
                <td><span className="badge">{p.permission}</span></td>
                <td><span className="small"><code>{p.id}</code></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
