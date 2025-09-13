import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      phone: '+34 123 456 789',
      address: 'Madrid, Spain',
      taxId: '12345678Z',
      retaNumber: 'RETA-001'
    }
  })

  // Create demo clients
  const clients = [
    {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, San Francisco, CA 94105',
      country: 'United States',
      currency: 'USD',
      isUSClient: true,
      userId: user.id
    },
    {
      name: 'TechStartup GmbH',
      email: 'finance@techstartup.de',
      phone: '+49 30 12345678',
      address: 'Alexanderplatz 1, Berlin, Germany',
      country: 'Germany',
      currency: 'EUR',
      isUSClient: false,
      taxId: 'DE123456789',
      userId: user.id
    },
    {
      name: 'Global Solutions Ltd',
      email: 'accounts@globalsolutions.co.uk',
      phone: '+44 20 1234 5678',
      address: '456 Business Ave, London, UK',
      country: 'United Kingdom',
      currency: 'EUR',
      isUSClient: false,
      taxId: 'GB123456789',
      userId: user.id
    },
    {
      name: 'Innovation Labs',
      email: 'payments@innovationlabs.com',
      phone: '+1 (415) 987-6543',
      address: '789 Tech Blvd, Palo Alto, CA 94301',
      country: 'United States',
      currency: 'USD',
      isUSClient: true,
      userId: user.id
    }
  ]

  for (const clientData of clients) {
    await prisma.client.upsert({
      where: { 
        name_userId: {
          name: clientData.name,
          userId: clientData.userId
        }
      },
      update: {},
      create: clientData
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })