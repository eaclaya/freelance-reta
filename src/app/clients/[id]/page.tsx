import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Mail, Phone, MapPin, CreditCard, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
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

  const client = await prisma.client.findUnique({
    where: { 
      id: params.id,
      userId: user.id
    },
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
    notFound()
  }

  const totalInvoiced = client.invoices.reduce((sum, invoice) => {
    return sum + (invoice.currency === 'EUR' ? invoice.totalCents : invoice.totalEurCents || 0)
  }, 0)

  const pendingInvoices = client.invoices.filter(invoice => 
    invoice.status === 'SENT' || invoice.status === 'OVERDUE'
  )

  const pendingAmount = pendingInvoices.reduce((sum, invoice) => {
    return sum + (invoice.currency === 'EUR' ? invoice.totalCents : invoice.totalEurCents || 0)
  }, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">RETA Freelance Accounting</h1>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <a href="/">Dashboard</a>
              </Button>
              <Button variant="default" asChild>
                <a href="/clients">Clients</a>
              </Button>
              <Button variant="ghost">Invoices</Button>
              <Button variant="ghost">Expenses</Button>
              <Button variant="ghost">Reports</Button>
              <Button variant="ghost">Calendar</Button>
              <Button variant="ghost" asChild>
                <a href="/profile">Profile</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <a href="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </a>
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h2>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    client.isUSClient 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {client.currency}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {client.country}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <a href={`/clients/${client.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </a>
                </Button>
                <Button asChild>
                  <a href={`/invoices/new?clientId=${client.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
              <p className="text-xs text-muted-foreground">
                {client._count.invoices} total invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {pendingInvoices.length} pending invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Since</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(client.createdAt)}</div>
              <p className="text-xs text-muted-foreground">
                Member since
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{client.email}</p>
                  </div>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">{client.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Country</p>
                  <p className="text-gray-600">{client.country}</p>
                </div>
              </div>
              
              {client.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">{client.address}</p>
                  </div>
                </div>
              )}
              
              {client.taxId && (
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Tax ID</p>
                    <p className="text-gray-600">{client.taxId}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoicing activity</CardDescription>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No invoices yet
                  <div className="mt-4">
                    <Button asChild>
                      <a href={`/invoices/new?clientId=${client.id}`}>
                        Create First Invoice
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">#{invoice.number}</p>
                        <p className="text-sm text-gray-600">{formatDate(invoice.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(invoice.totalCents, invoice.currency)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {client.invoices.length > 5 && (
                    <div className="text-center pt-3">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/invoices?clientId=${client.id}`}>
                          View All Invoices
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}