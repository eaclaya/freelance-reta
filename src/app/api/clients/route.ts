import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, email, phone, address, taxId, country, currency } = body
    
    if (!name || !country || !currency) {
      return NextResponse.json(
        { error: 'Name, country, and currency are required' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
        country,
        currency,
        isUSClient: currency === 'USD',
        userId: 'temp-user-id' // TODO: Replace with actual user ID from auth
      }
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    return NextResponse.json({ success: true, clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}