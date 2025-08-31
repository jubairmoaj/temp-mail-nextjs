import type { NextApiRequest, NextApiResponse } from 'next'

// In-memory storage (in production, use Redis or database)
const emails = new Map()

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { emailId } = req.query

  if (req.method === 'GET') {
    try {
      const emailData = emails.get(emailId as string)
      
      if (!emailData) {
        return res.status(404).json({ error: 'Email not found' })
      }
      
      res.status(200).json({
        email: emailData.email,
        messages: emailData.messages
      })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch emails' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = emails.delete(emailId as string)
      
      if (deleted) {
        res.status(200).json({ success: true, message: 'Email deleted' })
      } else {
        res.status(404).json({ error: 'Email not found' })
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete email' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
