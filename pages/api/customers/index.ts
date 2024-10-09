import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const customers = await prisma.customer.findMany({
        where: { userId },
      })
      res.status(200).json(customers)
    } catch (error) {
      res.status(400).json({ error: 'Unable to fetch customers' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, phone, company } = req.body
      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          company,
          userId,
        },
      })
      res.status(201).json(customer)
    } catch (error) {
      res.status(400).json({ error: 'Unable to create customer' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}