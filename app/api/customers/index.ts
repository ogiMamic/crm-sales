import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGET(req, res)
    case 'POST':
      return handlePOST(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

// GET /api/customers
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const customers = await prisma.customer.findMany()
  res.json(customers)
}

// POST /api/customers
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, phone, userId } = req.body
  const result = await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      userId,
    },
  })
  res.json(result)
}