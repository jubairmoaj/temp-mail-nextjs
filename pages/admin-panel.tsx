import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function AdminPanelAccess() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple password check (in production, use proper authentication)
    if (password === 'admin123') {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password')
    }
  }

  if (isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Panel - TempMail</title>
        </Head>
        
        <div className="container">
          <div className="card">
            <h1>🔐 Admin Access Granted</h1>
            <p>You can now access the admin panel.</p>
            <Link href="/admin" className="btn btn-primary">
              <i className="fas fa-cog"></i>
              Go to Admin Panel
            </Link>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Access - TempMail</title>
      </Head>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#3498db', marginBottom: '15px' }}></i>
            <h1>Admin Access</h1>
            <p>Enter password to access admin panel</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{ width: '100%' }}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <i className="fas fa-sign-in-alt"></i>
              Access Admin Panel
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/" className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
            <p><strong>Demo Password:</strong> admin123</p>
            <p><em>This is just for demonstration. In production, use proper authentication.</em></p>
          </div>
        </div>
      </div>
    </>
  )
}
