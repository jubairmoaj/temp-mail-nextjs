import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage (in production, use Redis or database)
const emails = new Map()

const domains = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'sharklasers.com',
  'grr.la'
]

// Helper function to generate random username
function generateRandomUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let username = ''
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return username
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { domain } = req.body
    
    if (!domain || !domains.includes(domain)) {
      return res.status(400).json({ error: 'Invalid domain' })
    }
    
    const username = generateRandomUsername()
    const email = `${username}@${domain}`
    const emailId = uuidv4()
    
    emails.set(emailId, {
      email,
      username,
      domain,
      messages: [],
      createdAt: Date.now()
    })
    
    res.status(200).json({
      emailId,
      email,
      username,
      domain
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate email' })
  }
}
