import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// GET specific service
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const service = await prisma.service.findUnique({
      where: { id }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Unable to fetch service' },
      { status: 500 }
    )
  }
}

// PATCH update service
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { name, description, defaultPrice, priceType } = await req.json()

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        defaultPrice: parseFloat(defaultPrice),
        priceType
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Unable to update service' },
      { status: 500 }
    )
  }
}

// DELETE service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await prisma.service.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Unable to delete service' },
      { status: 500 }
    )
  }
}