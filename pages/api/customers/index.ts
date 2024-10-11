import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const { name, email, phone, company, notes } = req.body
      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          company,
          notes,
          userId,
        },
      })
      res.status(201).json(customer)
    } catch (error) {
      console.error('Error adding customer:', error)
      res.status(400).json({ error: 'Unable to create customer' })
    }
  } else if (req.method === 'GET') {
    try {
      const customers = await prisma.customer.findMany({
        where: { userId },
      })
      res.status(200).json(customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      res.status(400).json({ error: 'Unable to fetch customers' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}