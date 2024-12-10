import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        offer: {
          include: {
            customer: true,
            offerServices: {
              include: {
                service: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PATCH /api/invoices/[id] - Update invoice status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, paymentDate } = body

    if (!['PAID', 'PENDING', 'OVERDUE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Allowed statuses are PAID, PENDING, or OVERDUE.' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    if (status === 'PAID') {
      updateData.paymentDate = new Date(paymentDate)
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}

