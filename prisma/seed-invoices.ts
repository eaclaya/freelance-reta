import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get the demo user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.error('No user found. Please run the main seed script first.')
    return
  }

  // Get demo clients
  const clients = await prisma.client.findMany({
    where: { userId: user.id }
  })

  if (clients.length === 0) {
    console.error('No clients found. Please run the main seed script first.')
    return
  }

  const usClient = clients.find(c => c.isUSClient)
  const euClient = clients.find(c => !c.isUSClient)

  if (!usClient || !euClient) {
    console.error('Need both US and EU clients for demo.')
    return
  }

  // Create sample invoices
  const invoices = [
    {
      number: 'INV-2024-01-001',
      date: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: 'PAID',
      clientId: usClient.id,
      currency: 'USD',
      exchangeRate: 0.85,
      description: 'Web Development Services - Q4 2023',
      notes: 'Payment terms: Net 30',
      subtotalCents: 500000, // $5000
      vatRate: 0,
      vatAmountCents: 0,
      totalCents: 500000,
      totalEurCents: 425000, // $5000 * 0.85
      withholdingRate: null,
      withholdingAmountCents: null,
      paidDate: new Date('2024-02-10'),
      items: [
        {
          description: 'Frontend Development',
          quantity: 40,
          unitPriceCents: 7500, // $75/hour
          totalCents: 300000 // $3000
        },
        {
          description: 'Backend API Development',
          quantity: 30,
          unitPriceCents: 5000, // $50/hour
          totalCents: 150000 // $1500
        },
        {
          description: 'Testing & Deployment',
          quantity: 10,
          unitPriceCents: 5000, // $50/hour
          totalCents: 50000 // $500
        }
      ]
    },
    {
      number: 'INV-2024-01-002',
      date: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
      status: 'SENT',
      clientId: euClient.id,
      currency: 'EUR',
      exchangeRate: null,
      description: 'Consulting Services - January 2024',
      subtotalCents: 300000, // €3000
      vatRate: 21,
      vatAmountCents: 63000, // €630
      totalCents: 363000, // €3630
      totalEurCents: null,
      withholdingRate: 15,
      withholdingAmountCents: 45000, // €450
      items: [
        {
          description: 'Technical Consulting',
          quantity: 20,
          unitPriceCents: 10000, // €100/hour
          totalCents: 200000 // €2000
        },
        {
          description: 'Project Management',
          quantity: 10,
          unitPriceCents: 10000, // €100/hour
          totalCents: 100000 // €1000
        }
      ]
    },
    {
      number: 'INV-2024-02-003',
      date: new Date('2024-02-01'),
      status: 'DRAFT',
      clientId: usClient.id,
      currency: 'USD',
      exchangeRate: 0.86,
      description: 'Mobile App Development - Phase 1',
      subtotalCents: 750000, // $7500
      vatRate: 0,
      vatAmountCents: 0,
      totalCents: 750000,
      totalEurCents: 645000, // $7500 * 0.86
      withholdingRate: null,
      withholdingAmountCents: null,
      items: [
        {
          description: 'iOS App Development',
          quantity: 50,
          unitPriceCents: 8000, // $80/hour
          totalCents: 400000 // $4000
        },
        {
          description: 'Android App Development',
          quantity: 45,
          unitPriceCents: 7500, // $75/hour
          totalCents: 337500 // $3375
        }
      ]
    }
  ]

  for (const invoiceData of invoices) {
    const { items, ...invoice } = invoiceData
    
    try {
      const createdInvoice = await prisma.invoice.create({
        data: {
          ...invoice,
          userId: user.id
        }
      })

      await prisma.invoiceItem.createMany({
        data: items.map(item => ({
          ...item,
          invoiceId: createdInvoice.id
        }))
      })

      console.log(`Created invoice ${invoice.number}`)
    } catch (error) {
      console.log(`Invoice ${invoice.number} already exists, skipping...`)
    }
  }

  console.log('Invoice seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })