import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      return handleGET(res, id as string)
    case 'PUT':
      return handlePUT(req, res, id as string)
    case 'DELETE':
      return handleDELETE(res, id as string)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

// GET /api/customers/:id
async function handleGET(res: NextApiResponse, id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
  })
  if (customer) {
    res.json(customer)
  } else {
    res.status(404).json({ message: 'Customer not found' })
  }
}

// PUT /api/customers/:id
async function handlePUT(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, email, phone } = req.body
  const customer = await prisma.customer.update({
    where: { id },
    data: { name, email, phone },
  })
  res.json(customer)
}

// DELETE /api/customers/:id
async function handleDELETE(res: NextApiResponse, id: string) {
  await prisma.customer.delete({
    where: { id },
  })
  res.status(204).end()
}