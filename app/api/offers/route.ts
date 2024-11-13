import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

export async function GET() {
  const offers = await prisma.offer.findMany({
    include: {
      customer: true,
    },
  })
  return NextResponse.json(offers)
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Fetch the customer to ensure it exists and belongs to the current user
    const customer = await prisma.customer.findFirst({
      where: {
        id: body.customerId,
        userId: userId
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found or does not belong to the current user' }, { status: 404 })
    }

    const offer = await prisma.offer.create({
      data: {
        number: body.number,
        customerId: body.customerId,
        date: new Date(body.date),
        status: body.status,
        amount: parseFloat(body.amount),
        product: body.productName,
        pricingType: body.pricingType,
      },
      include: {
        customer: true,
      },
    })
    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json({ error: 'Unable to create offer' }, { status: 500 })
  }
}