import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
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

interface GenerateEmailRequest {
  domain?: string
  customUsername?: string
  expiresIn?: number // hours
}

interface GenerateEmailResponse {
  success: boolean
  email?: string
  emailId?: string
  domain?: string
  username?: string
  expiresAt?: string
  error?: string
  message?: string
}

// Create database connection pool
const pool = mysql.createPool(dbConfig)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateEmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { domain, customUsername, expiresIn = 24 }: GenerateEmailRequest = req.body

    let selectedDomain: string

    if (domain) {
      // Use specified domain if provided
      const [domains] = await pool.execute(
        'SELECT id, name FROM virtual_domains WHERE name = ? AND active = 1',
        [domain]
      )

      if (Array.isArray(domains) && domains.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Domain ${domain} is not available or inactive` 
        })
      }

      selectedDomain = domain
    } else {
      // Select a random active domain
      const [domains] = await pool.execute(
        'SELECT name FROM virtual_domains WHERE active = 1 ORDER BY RAND() LIMIT 1'
      )

      if (Array.isArray(domains) && domains.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No active domains available' 
        })
      }

      selectedDomain = (domains as any[])[0].name
    }

    // Get domain ID
    const [domainResult] = await pool.execute(
      'SELECT id FROM virtual_domains WHERE name = ?',
      [selectedDomain]
    )

    const domainId = (domainResult as any[])[0].id

    // Generate username
    const username = customUsername || generateRandomUsername()
    const email = `${username}@${selectedDomain}`
    const emailId = uuidv4()
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000)

    // Check if email already exists
    const [existingEmails] = await pool.execute(
      'SELECT id FROM virtual_users WHERE email = ?',
      [email]
    )

    if (Array.isArray(existingEmails) && existingEmails.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists, please try again' 
      })
    }

    // Create virtual user in database
    await pool.execute(
      'INSERT INTO virtual_users (domain_id, email, password, active, created_at, expires_at) VALUES (?, ?, ?, 1, NOW(), ?)',
      [domainId, email, generateSecurePassword(), expiresAt]
    )

    // Create mail directory structure (if on VPS)
    await createMailDirectory(selectedDomain, username)

    res.status(200).json({
      success: true,
      email,
      emailId,
      domain: selectedDomain,
      username,
      expiresAt: expiresAt.toISOString(),
      message: `Temporary email ${email} created successfully! Expires in ${expiresIn} hours.`
    })

  } catch (error) {
    console.error('Error generating email:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate email' 
    })
  }
}

// Helper function to generate random username
function generateRandomUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let username = ''
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return username
}

// Helper function to generate secure password for email account
function generateSecurePassword(): string {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
}

// Helper function to create mail directory structure
async function createMailDirectory(domain: string, username: string): Promise<void> {
  try {
    const { exec } = require('child_process')
    const util = require('util')
    const execAsync = util.promisify(exec)

    const mailPath = `/var/mail/vhosts/${domain}/${username}`
    
    // Create directory structure
    await execAsync(`mkdir -p ${mailPath}/Maildir/new`)
    await execAsync(`mkdir -p ${mailPath}/Maildir/cur`)
    await execAsync(`mkdir -p ${mailPath}/Maildir/tmp`)
    
    // Set proper permissions
    await execAsync(`chown -R 5000:5000 ${mailPath}`)
    await execAsync(`chmod -R 700 ${mailPath}`)
    
  } catch (error) {
    console.error('Error creating mail directory:', error)
    // Don't fail the entire request if directory creation fails
  }
}

// Close database connection when the function ends
process.on('beforeExit', async () => {
  await pool.end()
})
