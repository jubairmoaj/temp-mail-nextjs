import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage (in production, use Redis or database)
const emails = new Map()

const demoMessages = [
  {
    from: 'noreply@example.com',
    subject: 'Welcome to TempMail!',
    text: 'This is a demo message to show how the system works.',
    html: '<p>This is a demo message to show how the system works.</p>'
  },
  {
    from: 'support@company.com',
    subject: 'Your account has been created',
    text: 'Thank you for using our service.',
    html: '<p>Thank you for using our service.</p>'
  },
  {
    from: 'newsletter@tech.com',
    subject: 'Weekly Tech Updates',
    text: 'Stay updated with the latest technology news.',
    html: '<p>Stay updated with the latest technology news.</p>'
  },
  {
    from: 'security@bank.com',
    subject: 'Important Security Alert',
    text: 'Please verify your account details.',
    html: '<p>Please verify your account details.</p>'
  },
  {
    from: 'marketing@store.com',
    subject: 'Special Offer - 50% Off!',
    text: 'Limited time offer on all products.',
    html: '<p>Limited time offer on all products.</p>'
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { emailId } = req.body
    
    if (!emailId) {
      return res.status(400).json({ error: 'Email ID is required' })
    }

    const emailData = emails.get(emailId)
    
    if (!emailData) {
      return res.status(404).json({ error: 'Email not found' })
    }

    // Add a random demo message
    const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)]
    const message = {
      id: uuidv4(),
      ...randomMessage,
      timestamp: Date.now()
    }
    
    emailData.messages.push(message)
    
    res.status(200).json({ 
      success: true, 
      message: 'Demo email added',
      newMessage: message
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add demo email' })
  }
}
