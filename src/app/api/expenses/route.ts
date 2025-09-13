import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ success: true, expenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      description,
      category,
      amountCents,
      currency = 'EUR',
      vatRate,
      isDeductible = true,
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

    const expense = await prisma.expense.create({
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
        notes,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}