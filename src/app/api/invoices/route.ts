import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      number,
      date,
      dueDate,
      clientId,
      description,
      notes,
      subtotalCents,
      vatRate,
      vatAmountCents,
      totalCents,
      currency,
      exchangeRate,
      totalEurCents,
      withholdingRate,
      withholdingAmountCents,
      items
    } = body
    
    if (!number || !date || !clientId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Invoice number, date, client, and items are required' },
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

    // Create the invoice with items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          number,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'DRAFT',
          subtotalCents,
          vatRate,
          vatAmountCents,
          totalCents,
          currency,
          exchangeRate,
          totalEurCents,
          withholdingRate,
          withholdingAmountCents,
          description,
          notes,
          userId: user.id,
          clientId
        }
      })

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          totalCents: item.totalCents,
          invoiceId: newInvoice.id
        }))
      })

      return newInvoice
    })

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error('Error creating invoice:', error)
    
    if (error.code === 'P2002' && error.meta?.target?.includes('number')) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

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

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        items: true
      }
    })

    return NextResponse.json({ success: true, invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}