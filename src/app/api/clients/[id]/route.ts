import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    const { name, email, phone, address, taxId, country, currency } = body
    
    if (!name || !country || !currency) {
      return NextResponse.json(
        { error: 'Name, country, and currency are required' },
        { status: 400 }
      )
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
        country,
        currency,
        isUSClient: currency === 'USD'
      }
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('Error updating client:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}