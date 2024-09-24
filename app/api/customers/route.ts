import { NextApiRequest, NextApiResponse } from 'next'

const customers = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', company: 'Tech Co' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', phone: '234-567-8901', company: 'Design Inc' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', company: 'Marketing LLC' },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(customers)
}