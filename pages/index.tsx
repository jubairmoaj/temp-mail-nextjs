import { useState, useEffect } from 'react'
import Head from 'next/head'

interface EmailData {
  emailId: string
  email: string
  username: string
  domain: string
}

interface Message {
  id: string
  from: string
  subject: string
  text: string
  html: string
  timestamp: number
}

export default function Home() {
  const [domains, setDomains] = useState<string[]>([])
  const [selectedDomain, setSelectedDomain] = useState('')
  const [currentEmail, setCurrentEmail] = useState<EmailData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; show: boolean }>({
    message: '',
    type: 'info',
    show: false
  })

  // Load domains on component mount
  useEffect(() => {
    loadDomains()
  }, [])

  // Auto-refresh inbox every 10 seconds
  useEffect(() => {
    if (currentEmail) {
      const interval = setInterval(() => {
        loadInbox()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [currentEmail])

  // Load available domains
  const loadDomains = async () => {
    try {
      const response = await fetch('/api/domains')
      const data = await response.json()
      setDomains(data.domains)
      if (data.domains.length > 0) {
        setSelectedDomain(data.domains[0])
      }
    } catch (error) {
      showToast('Failed to load domains', 'error')
    }
  }

  // Generate new email
  const generateEmail = async () => {
    if (!selectedDomain) {
      showToast('Please select a domain first', 'error')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain: selectedDomain })
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentEmail(data)
        setMessages([])
        showToast('Email generated successfully!', 'success')
        loadInbox()
      } else {
        showToast(data.error || 'Failed to generate email', 'error')
      }
    } catch (error) {
      showToast('Failed to generate email', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // Load inbox messages
  const loadInbox = async () => {
    if (!currentEmail) return

    try {
      const response = await fetch(`/api/emails/${currentEmail.emailId}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages)
      } else {
        showToast('Failed to load inbox', 'error')
      }
    } catch (error) {
      showToast('Failed to load inbox', 'error')
    }
  }

  // Refresh inbox manually
  const refreshInbox = async () => {
    setIsRefreshing(true)
    await loadInbox()
    setIsRefreshing(false)
  }

  // Delete current email
  const deleteEmail = async () => {
    if (!currentEmail) return

    if (!confirm('Are you sure you want to delete this email? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/emails/${currentEmail.emailId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCurrentEmail(null)
        setMessages([])
        showToast('Email deleted successfully', 'success')
      } else {
        showToast('Failed to delete email', 'error')
      }
    } catch (error) {
      showToast('Failed to delete email', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Copy email to clipboard
  const copyEmailToClipboard = async () => {
    if (!currentEmail) return

    try {
      await navigator.clipboard.writeText(currentEmail.email)
      showToast('Email copied to clipboard!', 'success')
    } catch (error) {
      showToast('Failed to copy email', 'error')
    }
  }

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, show: true })
    setTimeout(() => {
      setToast({ message: '', type: 'info', show: false })
    }, 3000)
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return 'Just now'
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Escape HTML content
  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return (
    <>
      <Head>
        <title>TempMail - Temporary Email Service</title>
        <meta name="description" content="Create disposable email addresses in one click with multiple domain options" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <i className="fas fa-envelope"></i>
            <h1>TempMail</h1>
          </div>
          <p className="tagline">Disposable Email Addresses in One Click</p>
        </header>

        <main className="main-content">
          {/* Email Generation Section */}
          <section className="email-section">
            <div className="card">
              <h2><i className="fas fa-plus-circle"></i> Generate New Email</h2>
              <div className="domain-selector">
                <label htmlFor="domainSelect">Choose Domain:</label>
                <select
                  id="domainSelect"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="">Select a domain...</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateEmail}
                disabled={isGenerating}
                className="btn btn-primary"
              >
                <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
                {isGenerating ? 'Generating...' : 'Generate Email'}
              </button>
            </div>
          </section>

          {/* Current Email Display */}
          {currentEmail && (
            <section className="email-section">
              <div className="card">
                <h2><i className="fas fa-envelope-open"></i> Your Temporary Email</h2>
                <div className="email-display">
                  <div className="email-address">
                    <span>{currentEmail.email}</span>
                    <button
                      onClick={copyEmailToClipboard}
                      className="btn btn-secondary"
                      title="Copy to clipboard"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                  <div className="email-info">
                    <p><strong>Domain:</strong> {currentEmail.domain}</p>
                    <p><strong>Created:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={refreshInbox}
                  disabled={isRefreshing}
                  className="btn btn-success"
                >
                  <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                  {isRefreshing ? 'Refreshing...' : 'Refresh Inbox'}
                </button>
                <button
                  onClick={deleteEmail}
                  disabled={isDeleting}
                  className="btn btn-danger"
                >
                  <i className={`fas ${isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                  {isDeleting ? 'Deleting...' : 'Delete Email'}
                </button>
              </div>
            </section>
          )}

          {/* Inbox Section */}
          {currentEmail && (
            <section className="email-section">
              <div className="card">
                <h2><i className="fas fa-inbox"></i> Inbox</h2>
                <div>
                  {messages.length === 0 ? (
                    <div className="empty-inbox">
                      <i className="fas fa-inbox"></i>
                      <p>No messages yet. Emails will appear here automatically.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="message-item">
                        <div className="message-header">
                          <span className="message-from">{escapeHtml(message.from)}</span>
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                        </div>
                        <div className="message-subject">{escapeHtml(message.subject)}</div>
                        <div className="message-content">
                          {escapeHtml(message.text || message.html.replace(/<[^>]*>/g, '') || 'No content')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Features Section */}
          <section className="features-section">
            <div className="card">
              <h2><i className="fas fa-star"></i> Features</h2>
              <div className="features-grid">
                <div className="feature">
                  <i className="fas fa-bolt"></i>
                  <h3>Instant Generation</h3>
                  <p>Create temporary emails in one click</p>
                </div>
                <div className="feature">
                  <i className="fas fa-shield-alt"></i>
                  <h3>Privacy First</h3>
                  <p>No registration or personal data required</p>
                </div>
                <div className="feature">
                  <i className="fas fa-clock"></i>
                  <h3>Auto Cleanup</h3>
                  <p>Emails are automatically deleted after 24 hours</p>
                </div>
                <div className="feature">
                  <i className="fas fa-globe"></i>
                  <h3>Multiple Domains</h3>
                  <p>Choose from various trusted domains</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <p>&copy; 2024 TempMail. A secure temporary email service.</p>
        </footer>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type} show`}>
          {toast.message}
        </div>
      )}
    </>
  )
}
