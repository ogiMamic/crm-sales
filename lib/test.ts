'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createUser() {
  try {
    const newUser = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        milan: 'some value'
      }
    })
    return { success: true, user: newUser }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}