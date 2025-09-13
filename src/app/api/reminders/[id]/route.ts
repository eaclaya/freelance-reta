import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { completed } = body
    
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

    const reminder = await prisma.reminder.update({
      where: { 
        id: params.id,
        userId: user.id
      },
      data: {
        completed
      }
    })

    return NextResponse.json({ success: true, reminder })
  } catch (error) {
    console.error('Error updating reminder:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await prisma.reminder.delete({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}