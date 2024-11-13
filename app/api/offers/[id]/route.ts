import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.offer.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Offer deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json({ error: 'Error deleting offer' }, { status: 500 })
  }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params
      const body = await request.json()
  
      const updatedOffer = await prisma.offer.update({
        where: { id },
        data: {
          customerId: body.customerId,
          date: body.date,
          status: body.status,
          amount: body.amount,
          product: body.product,
          pricingType: body.pricingType,
        },
        include: {
          customer: true,
        },
      })
  
      return NextResponse.json(updatedOffer)
    } catch (error) {
      console.error('Error updating offer:', error)
      return NextResponse.json({ error: 'Error updating offer' }, { status: 500 })
    }
  }