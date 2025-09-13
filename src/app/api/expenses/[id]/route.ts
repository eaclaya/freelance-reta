import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const expense = await prisma.expense.findUnique({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const {
      date,
      description,
      category,
      amountCents,
      currency,
      vatRate,
      isDeductible,
      notes
    } = body

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

    // Calculate VAT amount if rate is provided
    const vatAmountCents = vatRate ? Math.round(amountCents * (vatRate / 100)) : null

    // Handle currency conversion for USD expenses
    let exchangeRate = null
    let amountEurCents = amountCents

    if (currency === 'USD') {
      // Fetch current exchange rate
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await response.json()
        exchangeRate = data.rates.EUR
        amountEurCents = Math.round(amountCents * exchangeRate)
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using fallback')
        exchangeRate = 0.85 // Fallback rate
        amountEurCents = Math.round(amountCents * exchangeRate)
      }
    }

    const expense = await prisma.expense.update({
      where: { 
        id: params.id,
        userId: user.id
      },
      data: {
        date: new Date(date),
        description,
        category,
        amountCents,
        currency,
        exchangeRate,
        amountEurCents: currency === 'EUR' ? amountCents : amountEurCents,
        vatRate,
        vatAmountCents,
        isDeductible,
        notes
      }
    })

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error('Error updating expense:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update expense' },
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

    await prisma.expense.delete({
      where: { 
        id: params.id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}