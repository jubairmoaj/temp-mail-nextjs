import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

interface GenerateRealEmailRequest {
  domain: string
  customUsername?: string
  expiresIn?: number // hours
}

interface GenerateRealEmailResponse {
  success: boolean
  email?: string
  emailId?: string
  domain?: string
  username?: string
  expiresAt?: string
  error?: string
  message?: string
  setupInstructions?: {
    dnsRecords: Array<{
      type: string
      name: string
      value: string
      priority?: number
    }>
    emailServer: string
    nextSteps: string[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateRealEmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { domain, customUsername, expiresIn = 24 }: GenerateRealEmailRequest = req.body

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
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000)

    // Check if this is a real domain (you can add validation here)
    const isRealDomain = await checkDomainAvailability(domain)

    if (!isRealDomain) {
      return res.status(400).json({ 
        success: false, 
        error: `Domain ${domain} is not available or not configured for email` 
      })
    }

    // Generate setup instructions for real email
    const setupInstructions = generateSetupInstructions(domain)

    res.status(200).json({
      success: true,
      email,
      emailId,
      domain,
      username,
      expiresAt: expiresAt.toISOString(),
      message: `Real email ${email} created successfully! Expires in ${expiresIn} hours.`,
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

// Helper function to generate random username
function generateRandomUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let username = ''
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return username
}

// Check if domain is available for email (placeholder - implement real check)
async function checkDomainAvailability(domain: string): Promise<boolean> {
  // In production, this would check:
  // 1. Domain exists and is registered
  // 2. DNS is properly configured
  // 3. Email server is running
  
  // For now, accept any valid domain format
  return true
}

// Generate setup instructions for real email server
function generateSetupInstructions(domain: string) {
  return {
    dnsRecords: [
      {
        type: 'A',
        name: '@',
        value: 'YOUR_VPS_IP_ADDRESS' // Replace with actual VPS IP
      },
      {
        type: 'MX',
        name: '@',
        value: `mail.${domain}`,
        priority: 10
      },
      {
        type: 'A',
        name: 'mail',
        value: 'YOUR_VPS_IP_ADDRESS' // Replace with actual VPS IP
      },
      {
        type: 'TXT',
        name: '@',
        value: 'v=spf1 mx a ip4:YOUR_VPS_IP_ADDRESS ~all'
      },
      {
        type: 'TXT',
        name: 'default._domainkey',
        value: 'v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY'
      }
    ],
    emailServer: 'Postfix + Dovecot on Ubuntu VPS',
    nextSteps: [
      'Set up VPS with Ubuntu 22.04 LTS',
      'Install Postfix (SMTP) and Dovecot (IMAP)',
      'Configure SSL certificates with Let\'s Encrypt',
      'Set up MySQL database for virtual users',
      'Deploy your Next.js app to the VPS',
      'Update DNS records with your VPS IP address',
      'Test email delivery and reception'
    ]
  }
}
