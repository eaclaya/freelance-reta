import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSpanishTaxReminders, generateMonthlyInvoiceReminders } from '@/lib/spanish-tax-reminders'

export async function POST(request: NextRequest) {
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

    const currentYear = new Date().getFullYear()
    
    // Generate tax reminders for current and next year
    const taxReminders = [
      ...generateSpanishTaxReminders(currentYear),
      ...generateSpanishTaxReminders(currentYear + 1),
      ...generateMonthlyInvoiceReminders(currentYear),
      ...generateMonthlyInvoiceReminders(currentYear + 1)
    ]

    // Clear existing auto-generated reminders
    await prisma.reminder.deleteMany({
      where: {
        userId: user.id,
        type: { in: ['TAX_FILING', 'RETA_PAYMENT', 'INVOICE_DUE'] }
      }
    })

    // Insert new reminders
    const createdReminders = await Promise.all(
      taxReminders.map(reminder => 
        prisma.reminder.create({
          data: {
            title: reminder.title,
            description: reminder.description,
            type: reminder.type,
            date: reminder.date,
            recurring: reminder.recurring,
            frequency: reminder.frequency || null,
            userId: user.id
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdReminders.length} Spanish tax and business reminders`,
      reminders: createdReminders.length
    })
  } catch (error) {
    console.error('Error seeding Spanish tax reminders:', error)
    return NextResponse.json(
      { error: 'Failed to seed Spanish tax reminders' },
      { status: 500 }
    )
  }
}