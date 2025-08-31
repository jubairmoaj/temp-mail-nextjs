import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

// This is an example implementation for real email generation
// You'll need to install: npm install mailgun.js form-data

interface RealEmailRequest {
  domain: string
  customUsername?: string
}

interface RealEmailResponse {
  success: boolean
  email?: string
  emailId?: string
  error?: string
  setupInstructions?: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RealEmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { domain, customUsername }: RealEmailRequest = req.body

    if (!domain) {
      return res.status(400).json({ 
        success: false, 
        error: 'Domain is required' 
      })
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid domain format' 
      })
    }

    // Generate username
    const username = customUsername || generateRandomUsername()
    const email = `${username}@${domain}`
    const emailId = uuidv4()

    // For real implementation, you would:
    // 1. Set up email forwarding rules with Mailgun/SendGrid
    // 2. Store email configuration in database
    // 3. Configure webhook endpoints

    const setupInstructions = [
      `1. Configure DNS records for ${domain}:`,
      `   - MX record: mail.${domain} → [Your Server IP]`,
      `   - A record: mail.${domain} → [Your Server IP]`,
      `   - SPF record: v=spf1 a mx ~all`,
      '',
      `2. Set up email server (Postfix/Dovecot) or use Mailgun/SendGrid`,
      '',
      `3. Configure webhook to: https://yourdomain.com/api/receive-email`,
      '',
      `4. Test by sending email to: ${email}`,
      '',
      '📧 Your temporary email is ready:',
      `   ${email}`,
      '',
      '⚠️  Note: This is a demo. For real emails, follow the setup guide.'
    ]

    res.status(200).json({
      success: true,
      email,
      emailId,
      setupInstructions
    })

  } catch (error) {
    console.error('Error generating real email:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate email' 
    })
  }
}

function generateRandomUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let username = ''
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return username
}
