import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  switch (req.method) {
    case 'GET':
      return handleGET(res, id as string, userId)
    case 'PUT':
      return handlePUT(req, res, id as string, userId)
    case 'DELETE':
      return handleDELETE(res, id as string, userId)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGET(res: NextApiResponse, id: string, userId: string) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id, userId },
    })
    if (customer) {
      res.json(customer)
    } else {
      res.status(404).json({ message: 'Customer not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch customer' })
  }
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse, id: string, userId: string) {
  try {
    const { name, email, phone, company } = req.body
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, company },
    })
    res.json(customer)
  } catch (error) {
    res.status(400).json({ error: 'Unable to update customer' })
  }
}

async function handleDELETE(res: NextApiResponse, id: string, userId: string) {
  try {
    await prisma.customer.delete({
      where: { id },
    })
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ error: 'Unable to delete customer' })
  }
}