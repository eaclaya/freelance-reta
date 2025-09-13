import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get or create a default user for demo purposes
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@freelancer.es',
          name: 'Demo Freelancer',
          phone: '+34 123 456 789',
          address: 'Madrid, Spain',
          taxId: '12345678Z',
          retaNumber: 'RETA-001'
        }
      })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { email, name, phone, address, taxId, retaNumber } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get or create a default user for demo purposes
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@freelancer.es',
          name: 'Demo Freelancer',
          phone: '+34 123 456 789',
          address: 'Madrid, Spain',
          taxId: '12345678Z',
          retaNumber: 'RETA-001'
        }
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        name,
        phone,
        address,
        taxId,
        retaNumber
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}