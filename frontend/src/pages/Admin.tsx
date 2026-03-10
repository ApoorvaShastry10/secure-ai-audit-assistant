import React, { useEffect, useState } from 'react'
import { apiUsers, apiPolicies, apiCreateUser, apiCreatePolicy } from '../api'
import { getAccessToken } from '../auth'

export default function Admin() {
  const [users, setUsers] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rolesInput, setRolesInput] = useState('')

  const [polRole, setPolRole] = useState('')
  const [polDoc, setPolDoc] = useState('')
  const [polPerm, setPolPerm] = useState('READ')

  async function load() {
    setError(null)
    setMsg(null)
    try {
      const token = getAccessToken()
      if (!token) throw new Error('Please login first.')
      const [u, p] = await Promise.all([apiUsers(token), apiPolicies(token)])
      setUsers(u); setPolicies(p)
    } catch (e: any) { setError(e.message || 'Failed') }
  }

  useEffect(() => { load() }, [])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setMsg(null)
    try {
      const token = getAccessToken()
      if (!token) return
      const rolesArray = rolesInput.split(',').map(s => s.trim()).filter(Boolean)
      await apiCreateUser(token, email, password, rolesArray)
      setMsg(`User ${email} created!`)
      setEmail(''); setPassword(''); setRolesInput('')
      load()
    } catch (e: any) { setError(e.message || 'Failed to create user') }
  }

  async function handleCreatePolicy(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setMsg(null)
    try {
      const token = getAccessToken()
      if (!token) return
      await apiCreatePolicy(token, polRole, polDoc, polPerm)
      setMsg(`Policy assigned for ${polRole}!`)
      setPolRole(''); setPolDoc(''); setPolPerm('READ')
      load()
    } catch (e: any) { setError(e.message || 'Failed to create policy') }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="card" style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent)' }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Access Control Center
          </h3>
          <button className="btn secondary" onClick={load} style={{ fontSize: 13, padding: '6px 14px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            Sync State
          </button>
        </div>
        <div className="small" style={{ color: 'var(--text-muted)' }}>Configure strict cryptographic mappings between Identities (Users), Capabilities (Roles), and Resources (Documents).</div>
        {error && <div className="small" style={{ color: 'var(--danger)', marginTop: 12, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 6 }}>{error}</div>}
        {msg && <div className="small" style={{ color: 'var(--success)', marginTop: 12, padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 6 }}>{msg}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Register Identity</h4>
          <form style={{ display: 'grid', gap: 12 }} onSubmit={handleCreateUser}>
            <input className="input" placeholder="Corporate Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Secure Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <input className="input" placeholder="Roles (e.g. auditor, executive)" value={rolesInput} onChange={e => setRolesInput(e.target.value)} required />
            <button className="btn primary" type="submit" style={{ marginTop: 8 }}>Provision User</button>
          </form>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Issue Cryptographic Policy</h4>
          <form style={{ display: 'grid', gap: 12 }} onSubmit={handleCreatePolicy}>
            <input className="input" placeholder="Target Role Group" value={polRole} onChange={e => setPolRole(e.target.value)} required />
            <input className="input" placeholder="Target Document Hash ID" value={polDoc} onChange={e => setPolDoc(e.target.value)} required />
            <select className="input" value={polPerm} onChange={e => setPolPerm(e.target.value)}>
              <option value="READ">READ (Decrypt & Query)</option>
              <option value="WRITE">WRITE (Modify)</option>
            </select>
            <button className="btn primary" type="submit" style={{ marginTop: 8 }}>Sign Protocol</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Directory of Identities</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Email Address</th><th>Assigned Capabilities</th><th>Status</th><th>UUID</th></tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500, color: '#f8fafc' }}>{u.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(u.roles || []).map((r: string) => <span key={r} className="badge">{r}</span>)}
                    </div>
                  </td>
                  <td>
                    {u.is_active ?
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> Active</span> :
                      <span style={{ color: 'var(--text-muted)' }}>Suspended</span>
                    }
                  </td>
                  <td><code>{u.id.substring(0, 8)}...</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Active Enterprise Policies</h3>
        {policies.length === 0 ? <div className="small" style={{ opacity: 0.5 }}>No cryptographic policies detected.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Consumer Role</th><th>Target Resource Hash</th><th>Protocol</th><th>Policy UUID</th></tr></thead>
              <tbody>
                {policies.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500, color: 'var(--accent)' }}>{p.role_name}</td>
                    <td><code>{p.doc_id.substring(0, 16)}...</code></td>
                    <td><span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)' }}>{p.permission}</span></td>
                    <td><code>{p.id.substring(0, 8)}...</code></td>
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
