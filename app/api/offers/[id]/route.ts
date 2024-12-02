import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Error fetching offer' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      services,
      taxPercentage = 19,
      discountPercentage = 0
    } = body

    // Calculate amounts
    const subtotalAmount = services.reduce((sum: number, service: any) => 
      sum + (service.quantity * service.unitPrice), 0)
    const discountAmount = (subtotalAmount * discountPercentage) / 100
    const taxableAmount = subtotalAmount - (discountAmount || 0)
    const taxAmount = (taxableAmount * taxPercentage) / 100
    const totalAmount = taxableAmount + taxAmount

    // Delete existing offer services
    await prisma.offerService.deleteMany({
      where: { offerId: params.id }
    })

    // Update offer with new services
    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: {
        taxPercentage,
        taxAmount,
        discountPercentage,
        discountAmount,
        subtotalAmount,
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
    return NextResponse.json({ error: 'Error updating offer' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete offer services first
    await prisma.offerService.deleteMany({
      where: { offerId: params.id }
    })

    // Then delete the offer
    await prisma.offer.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Offer deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting offer' }, { status: 500 })
  }
}

