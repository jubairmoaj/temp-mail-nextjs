import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mailserver',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

interface TempEmail {
  id: number
  email: string
  domain: string
  username: string
  active: boolean
  createdAt: string
  expiresAt: string
  messageCount: number
  isExpired: boolean
}

interface ListEmailsResponse {
  success: boolean
  emails?: TempEmail[]
  error?: string
  total?: number
  activeCount?: number
  expiredCount?: number
}

// Create database connection pool
const pool = mysql.createPool(dbConfig)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListEmailsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { domain, active, limit = 50, offset = 0 } = req.query

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (domain) {
      whereClause += ' AND d.name = ?'
      params.push(domain)
    }

    if (active !== undefined) {
      whereClause += ' AND u.active = ?'
      params.push(active === 'true' ? 1 : 0)
    }

    // Get emails with message count
    const [emails] = await pool.execute(`
      SELECT 
        u.id,
        u.email,
        d.name as domain,
        SUBSTRING_INDEX(u.email, '@', 1) as username,
        u.active,
        u.created_at,
        u.expires_at,
        COUNT(m.id) as message_count
      FROM virtual_users u
      JOIN virtual_domains d ON u.domain_id = d.id
      LEFT JOIN messages m ON u.id = m.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit as string), parseInt(offset as string)])

    // Get total count
    const [totalResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM virtual_users u
      JOIN virtual_domains d ON u.domain_id = d.id
      ${whereClause}
    `, params)

    const total = (totalResult as any[])[0].total

    // Get active and expired counts
    const [countsResult] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN u.active = 1 THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN u.expires_at < NOW() THEN 1 ELSE 0 END) as expired_count
      FROM virtual_users u
      JOIN virtual_domains d ON u.domain_id = d.id
      ${whereClause}
    `, params)

    const counts = (countsResult as any[])[0]

    const formattedEmails = (emails as any[]).map(email => ({
      id: email.id,
      email: email.email,
      domain: email.domain,
      username: email.username,
      active: email.active === 1,
      createdAt: email.created_at,
      expiresAt: email.expires_at,
      messageCount: parseInt(email.message_count) || 0,
      isExpired: new Date(email.expires_at) < new Date()
    }))

    res.status(200).json({
      success: true,
      emails: formattedEmails,
      total,
      activeCount: parseInt(counts.active_count) || 0,
      expiredCount: parseInt(counts.expired_count) || 0
    })

  } catch (error) {
    console.error('Error listing emails:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list emails' 
    })
  }
}

// Close database connection when the function ends
process.on('beforeExit', async () => {
  await pool.end()
})
