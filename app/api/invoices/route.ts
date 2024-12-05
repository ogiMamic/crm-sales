import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/invoices - Get all invoices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause = {}
    if (status) {
      whereClause = { status }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
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
    
    return NextResponse.json(invoices)
  } catch (error) {
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

    // Get the offer to calculate amounts
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        offerServices: true
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Check if invoice already exists for this offer
    const existingInvoice = await prisma.invoice.findUnique({
      where: { offerId: offerId }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice already exists for this offer' },
        { status: 400 }
      )
    }

    // Generate invoice number (you can customize this)
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`

    // Create invoice
    const invoice = await prisma.invoice.create({
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
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

