import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiLogin } from '../api'
import { setTokens } from '../auth'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('AdminPass123!')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="card" style={{maxWidth: 520}}>
      <h3 style={{marginTop:0}}>Login</h3>
      <div className="small" style={{marginBottom: 10}}>Use seeded users after running the seed script.</div>
      <div style={{display:'grid', gap:10}}>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
        <input className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" />
        <button className="btn" disabled={busy} onClick={async () => {
          setBusy(true); setError(null)
          try {
            const t = await apiLogin(email, password)
            setTokens(t.access_token, t.refresh_token)
            nav('/dashboard')
          } catch (e:any) { setError(e.message || 'Login failed') }
          finally { setBusy(false) }
        }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {error && <div className="small" style={{color:'crimson'}}>{error}</div>}
      </div>
    </div>
  )
}
