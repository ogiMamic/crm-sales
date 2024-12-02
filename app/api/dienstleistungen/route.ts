import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'
import { parse } from 'path'

const prisma = new PrismaClient()

// GET all services
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Unable to fetch services' },
      { status: 500 }
    )
  }
}

// POST new service
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, defaultPrice, priceType } = await req.json()

    const service = await prisma.service.create({
      data: {
        name,
        description,
        defaultPrice: parseFloat(defaultPrice),
        priceType
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Unable to create service' },
      { status: 500 }
    )
  }
}