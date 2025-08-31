import type { NextApiRequest, NextApiResponse } from 'next'

interface Domain {
  id: number
  name: string
  description: string
  active: boolean
  emailCount: number
  createdAt: string
}

interface ListDomainsResponse {
  success: boolean
  domains?: Domain[]
  error?: string
  total?: number
}

// Temporary in-memory storage for demo purposes
// In production, this would be replaced with MySQL
const tempDomains: Domain[] = [
  {
    id: 1,
    name: 'tempmail.com',
    description: 'Primary temporary email domain',
    active: true,
    emailCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '10minutemail.com',
    description: 'Quick temporary emails',
    active: true,
    emailCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'guerrillamail.com',
    description: 'Guerrilla temporary emails',
    active: true,
    emailCount: 0,
    createdAt: new Date().toISOString()
  }
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListDomainsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    // Return the temporary domains for now
    res.status(200).json({
      success: true,
      domains: tempDomains,
      total: tempDomains.length
    })

  } catch (error) {
    console.error('Error listing domains:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list domains' 
    })
  }
}
