import { useState, useEffect } from 'react'
import Head from 'next/head'

interface Domain {
  id: number
  name: string
  description: string
  active: boolean
  emailCount: number
  createdAt: string
}

interface AddDomainForm {
  domain: string
  description: string
  active: boolean
}

export default function AdminPanel() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<AddDomainForm>({
    domain: '',
    description: '',
    active: true
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load domains on component mount
  useEffect(() => {
    loadDomains()
  }, [])

  // Load all domains
  const loadDomains = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/list-domains')
      const data = await response.json()
      
      if (data.success) {
        setDomains(data.domains)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load domains' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load domains' })
    } finally {
      setLoading(false)
    }
  }

  // Add new domain
  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/add-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addForm)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setAddForm({ domain: '', description: '', active: true })
        setShowAddForm(false)
        loadDomains() // Reload the list
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add domain' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add domain' })
    }
  }

  // Toggle domain status
  const toggleDomain = async (domainId: number, currentActive: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-domain', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domainId,
          active: !currentActive
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        loadDomains() // Reload the list
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to toggle domain' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle domain' })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <Head>
        <title>Admin Panel - TempMail</title>
        <meta name="description" content="Admin panel for managing domains and system" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <i className="fas fa-cog"></i>
            <h1>Admin Panel</h1>
          </div>
          <p className="tagline">Manage Domains & System Settings</p>
        </header>

        <main className="main-content">
          {/* Message Display */}
          {message && (
            <div className={`alert alert-${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              {message.text}
              <button 
                onClick={() => setMessage(null)}
                className="alert-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Add Domain Section */}
          <section className="admin-section">
            <div className="card">
              <div className="section-header">
                <h2><i className="fas fa-plus-circle"></i> Add New Domain</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="btn btn-primary"
                >
                  <i className={`fas fa-${showAddForm ? 'minus' : 'plus'}`}></i>
                  {showAddForm ? 'Hide Form' : 'Add Domain'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={addDomain} className="add-domain-form">
                  <div className="form-group">
                    <label htmlFor="domain">Domain Name:</label>
                    <input
                      type="text"
                      id="domain"
                      value={addForm.domain}
                      onChange={(e) => setAddForm({ ...addForm, domain: e.target.value })}
                      placeholder="example.com"
                      required
                      pattern="[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}"
                      title="Enter a valid domain name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      placeholder="Brief description of this domain"
                      rows={3}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={addForm.active}
                        onChange={(e) => setAddForm({ ...addForm, active: e.target.checked })}
                      />
                      Active (available for email generation)
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-save"></i> Add Domain
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Domains List Section */}
          <section className="admin-section">
            <div className="card">
              <div className="section-header">
                <h2><i className="fas fa-globe"></i> Manage Domains</h2>
                <button
                  onClick={loadDomains}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <i className={`fas fa-${loading ? 'spinner fa-spin' : 'sync-alt'}`}></i>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading domains...</p>
                </div>
              ) : domains.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-globe"></i>
                  <p>No domains found. Add your first domain above.</p>
                </div>
              ) : (
                <div className="domains-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Emails</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain) => (
                        <tr key={domain.id}>
                          <td className="domain-name">
                            <strong>{domain.name}</strong>
                          </td>
                          <td className="domain-description">
                            {domain.description || 'No description'}
                          </td>
                          <td className="domain-status">
                            <span className={`status-badge ${domain.active ? 'active' : 'inactive'}`}>
                              <i className={`fas fa-${domain.active ? 'check-circle' : 'times-circle'}`}></i>
                              {domain.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="domain-emails">
                            <span className="email-count">
                              {domain.emailCount}
                            </span>
                          </td>
                          <td className="domain-created">
                            {formatDate(domain.createdAt)}
                          </td>
                          <td className="domain-actions">
                            <button
                              onClick={() => toggleDomain(domain.id, domain.active)}
                              className={`btn btn-sm ${domain.active ? 'btn-warning' : 'btn-success'}`}
                              title={domain.active ? 'Disable domain' : 'Enable domain'}
                            >
                              <i className={`fas fa-${domain.active ? 'pause' : 'play'}`}></i>
                              {domain.active ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* System Statistics */}
          <section className="admin-section">
            <div className="card">
              <h2><i className="fas fa-chart-bar"></i> System Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-globe"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Total Domains</h3>
                    <p className="stat-number">{domains.length}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Active Domains</h3>
                    <p className="stat-number">{domains.filter(d => d.active).length}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Total Emails</h3>
                    <p className="stat-number">{domains.reduce((sum, d) => sum + d.emailCount, 0)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Latest Domain</h3>
                    <p className="stat-text">
                      {domains.length > 0 ? formatDate(domains[0].createdAt) : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <p>&copy; 2024 TempMail Admin Panel. Secure domain management.</p>
        </footer>
      </div>
    </>
  )
}
