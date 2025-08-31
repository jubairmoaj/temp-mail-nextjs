import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage (in production, use Redis or database)
const emails = new Map()

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, from, subject, text, html } = req.body
    
    // Find the email storage by recipient
    for (const [emailId, emailData] of emails.entries()) {
      if (emailData.email === to) {
        const message = {
          id: uuidv4(),
          from,
          subject: subject || 'No Subject',
          text: text || '',
          html: html || '',
          timestamp: Date.now()
        }
        
        emailData.messages.push(message)
        break
      }
    }
    
    res.status(200).json({ success: true, message: 'Email received' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive email' })
  }
}
