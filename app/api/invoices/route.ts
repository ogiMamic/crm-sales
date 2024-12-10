import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/invoices - Fetch all invoices
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { offerId, dueDate, notes } = body

    // Use a transaction to ensure data consistency
    const invoice = await prisma.$transaction(async (tx) => {
      // Get the offer to calculate amounts
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: {
          offerServices: {
            include: {
              service: true
            }
          }
        }
      })

      if (!offer) {
        throw new Error('Offer not found')
      }

      // Check if invoice already exists for this offer
      const existingInvoice = await tx.invoice.findUnique({
        where: { offerId: offerId }
      })

      if (existingInvoice) {
        throw new Error('Invoice already exists for this offer')
      }

      // Generate invoice number (you can customize this)
      const invoiceCount = await tx.invoice.count()
      const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`

      // Create invoice
      return await tx.invoice.create({
        data: {
          number: invoiceNumber,
          offerId: offer.id,
          status: 'PENDING',
          issueDate: new Date(),
          dueDate: new Date(dueDate),
          subtotalAmount: offer.subtotalAmount,
          taxPercentage: offer.taxPercentage,
          taxAmount: offer.taxAmount,
          discountAmount: offer.discountAmount,
          totalAmount: offer.totalAmount,
          notes: notes
        },
        include: {
          offer: {
            include: {
              offerServices: {
                include: {
                  service: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

