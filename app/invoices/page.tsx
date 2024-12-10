import { PrismaClient } from '@prisma/client'
import InvoicesClient from './invoices-client'

const prisma = new PrismaClient()

async function getInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: {
      offer: {
        include: {
          customer: true
        }
      }
    }
  })

  // Update overdue invoices
  const today = new Date()
  for (const invoice of invoices) {
    if (invoice.status !== 'PAID' && new Date(invoice.dueDate) < today) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' }
      })
      invoice.status = 'OVERDUE'
    }
  }

  return invoices
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return <InvoicesClient initialInvoices={invoices} />
}

