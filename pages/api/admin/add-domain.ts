import type { NextApiRequest, NextApiResponse } from 'next'

interface AddDomainRequest {
  domain: string
  description?: string
  active?: boolean
}

interface AddDomainResponse {
  success: boolean
  message?: string
  error?: string
  domain?: {
    id: number
    name: string
    active: boolean
    createdAt: string
  }
}

// Temporary in-memory storage for demo purposes
// In production, this would be replaced with MySQL
let tempDomains: Array<{
  id: number
  name: string
  description: string
  active: boolean
  createdAt: string
}> = [
  {
    id: 1,
    name: 'tempmail.com',
    description: 'Primary temporary email domain',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '10minutemail.com',
    description: 'Quick temporary emails',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'guerrillamail.com',
    description: 'Guerrilla temporary emails',
    active: true,
    createdAt: new Date().toISOString()
  }
]

let nextId = 4

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddDomainResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { domain, description = '', active = true }: AddDomainRequest = req.body

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

    // Check if domain already exists
    const existingDomain = tempDomains.find(d => d.name === domain)
    if (existingDomain) {
      return res.status(400).json({ 
        success: false, 
        error: `Domain ${domain} already exists` 
      })
    }

    // Add new domain to temporary storage
    const newDomain = {
      id: nextId++,
      name: domain,
      description,
      active,
      createdAt: new Date().toISOString()
    }

    tempDomains.push(newDomain)

    res.status(200).json({
      success: true,
      message: `Domain ${domain} added successfully`,
      domain: {
        id: newDomain.id,
        name: newDomain.name,
        active: newDomain.active,
        createdAt: newDomain.createdAt
      }
    })

  } catch (error) {
    console.error('Error adding domain:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add domain' 
    })
  }
}
