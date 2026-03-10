import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuditLogs from './pages/AuditLogs'
import Admin from './pages/Admin'
import GraphNetwork from './pages/GraphNetwork'
import { getAccessToken, logout, getUserRoles } from './auth'

export default function App() {
  const nav = useNavigate()
  const location = useLocation()
  const token = getAccessToken()
  const roles = getUserRoles()
  const isAdmin = roles.includes('admin')

  // Redirect to login if unauthenticated and not already on login page
  useEffect(() => {
    if (!token && location.pathname !== '/login') {
      nav('/login')
    }
  }, [token, location.pathname, nav])

  return (
    <div>
      <div style={{ position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <header className="row" style={{ justifyContent: 'space-between', marginBottom: 32 }}>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.02em', background: 'var(--text-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Secure AI Audit Assistant
            </h2>
          </div>
          <div className="row">
            {token ? <button className="btn secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => { logout(); nav('/login') }}>Sign Out</button> : <span className="small">Not securely connected</span>}
          </div>
        </header>

        {token && (
          <nav className="nav">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button style={location.pathname === '/dashboard' || location.pathname === '/' ? { fontWeight: 'bold' } : {}}>Dashboard</button>
            </Link>
            <Link to="/audit-logs" style={{ textDecoration: 'none' }}>
              <button style={location.pathname === '/audit-logs' ? { fontWeight: 'bold' } : {}}>Audit Logs</button>
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <button style={location.pathname === '/admin' ? { fontWeight: 'bold' } : {}}>Access Control</button>
                </Link>
                <Link to="/graph" style={{ textDecoration: 'none' }}>
                  <button style={location.pathname === '/graph' ? { fontWeight: 'bold' } : {}}>Knowledge Graph</button>
                </Link>
              </>
            )}
          </nav>
        )}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/graph" element={<GraphNetwork />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  )
}
