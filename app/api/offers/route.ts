import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      include: {
        customer: true,
        offerServices: {
          include: {
            service: true
          }
        }
      }
    })
    return NextResponse.json(offers)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching offers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerId,
      services,
      taxPercentage = 19,
      discountPercentage = 0
    } = body

    // Generate unique offer number (you may want to customize this)
    const lastOffer = await prisma.offer.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    const nextNumber = lastOffer 
      ? String(Number(lastOffer.number) + 1).padStart(5, '0')
      : '00001'

    // Calculate amounts
    const subtotalAmount = services.reduce((sum: number, service: any) => 
      sum + (service.quantity * service.unitPrice), 0)
    const discountAmount = (subtotalAmount * discountPercentage) / 100
    const taxableAmount = subtotalAmount - (discountAmount || 0)
    const taxAmount = (taxableAmount * taxPercentage) / 100
    const totalAmount = taxableAmount + taxAmount

    const offer = await prisma.offer.create({
      data: {
        number: nextNumber,
        customerId,
        date: new Date(),
        status: 'DRAFT',
        subtotalAmount,
        taxPercentage,
        taxAmount,
        discountPercentage,
        discountAmount,
        totalAmount,
        offerServices: {
          create: services.map((service: any) => ({
            serviceId: service.serviceId,
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            totalPrice: service.quantity * service.unitPrice
          }))
        }
      },
      include: {
        customer: true,
        offerServices: {
          include: {
            service: true
          }
        }
      }
    })

    return NextResponse.json(offer)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating offer' }, { status: 500 })
  }
}

