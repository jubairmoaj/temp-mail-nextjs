import type { NextApiRequest, NextApiResponse } from 'next'

interface ToggleDomainRequest {
  domainId: number
  active: boolean
}

interface ToggleDomainResponse {
  success: boolean
  message?: string
  error?: string
  domain?: {
    id: number
    name: string
    active: boolean
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ToggleDomainResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { domainId, active }: ToggleDomainRequest = req.body

    if (!domainId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Domain ID is required' 
      })
    }

    // Check if domain exists
    const domainIndex = tempDomains.findIndex(d => d.id === domainId)
    if (domainIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Domain not found' 
      })
    }

    const domain = tempDomains[domainIndex]

    // Update domain status
    tempDomains[domainIndex] = {
      ...domain,
      active
    }

    res.status(200).json({
      success: true,
      message: `Domain ${domain.name} ${active ? 'enabled' : 'disabled'} successfully`,
      domain: {
        id: domain.id,
        name: domain.name,
        active
      }
    })

  } catch (error) {
    console.error('Error toggling domain:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle domain' 
    })
  }
}
