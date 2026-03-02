import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuditLogs from './pages/AuditLogs'
import Admin from './pages/Admin'
import { getAccessToken, logout } from './auth'

export default function App() {
  const nav = useNavigate()
  const token = getAccessToken()

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', marginBottom: 12}}>
        <h2 style={{margin:0}}>Secure AI Audit Assistant</h2>
        <div className="row">
          {token ? <button className="btn secondary" onClick={() => { logout(); nav('/login') }}>Logout</button> : <span className="small">Not logged in</span>}
        </div>
      </div>

      <div className="nav">
        <Link className="badge" to="/dashboard">Dashboard</Link>
        <Link className="badge" to="/audit-logs">Audit Logs</Link>
        <Link className="badge" to="/admin">Admin</Link>
        <Link className="badge" to="/login">Login</Link>
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  )
}
