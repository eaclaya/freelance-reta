import { notFound } from 'next/navigation';
import { ArrowLeft, Edit, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoicePDFDownload } from '@/components/InvoicePDFDownload';
import { InvoiceStatusActions } from '@/components/InvoiceStatusActions';

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  // Get or create a default user for demo purposes
  let user = await prisma.user.findFirst();
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
    });
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: params.id,
      userId: user.id
    },
    include: {
      client: true,
      items: true
    }
  });

  if (!invoice) {
    notFound();
  }

  const statusColor = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

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
              <Button variant="ghost" asChild>
                <a href="/clients">Clients</a>
              </Button>
              <Button variant="default" asChild>
                <a href="/invoices">Invoices</a>
              </Button>
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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-4">
              <a href="/invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </a>
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice #{invoice.number}</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[invoice.status]}`}>{invoice.status}</span>
                <span className="text-gray-600">{formatDate(invoice.date)}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <InvoicePDFDownload
              invoice={{
                id: invoice.id,
                number: invoice.number,
                date: invoice.date,
                dueDate: invoice.dueDate,
                status: invoice.status,
                description: invoice.description,
                notes: invoice.notes,
                subtotalCents: invoice.subtotalCents,
                vatRate: invoice.vatRate,
                vatAmountCents: invoice.vatAmountCents,
                totalCents: invoice.totalCents,
                currency: invoice.currency,
                exchangeRate: invoice.exchangeRate,
                totalEurCents: invoice.totalEurCents,
                withholdingRate: invoice.withholdingRate,
                withholdingAmountCents: invoice.withholdingAmountCents,
                paidDate: invoice.paidDate,
                client: {
                  name: invoice.client.name,
                  email: invoice.client.email,
                  address: invoice.client.address,
                  country: invoice.client.country,
                  taxId: invoice.client.taxId,
                  isUSClient: invoice.client.isUSClient
                },
                items: invoice.items.map((item) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPriceCents: item.unitPriceCents,
                  totalCents: item.totalCents
                }))
              }}
              user={{
                name: user.name,
                email: user.email,
                address: user.address,
                taxId: user.taxId,
                retaNumber: user.retaNumber
              }}
            />

            <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />

            <Button variant="outline" asChild>
              <a href={`/invoices/${invoice.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(invoice.totalCents, invoice.currency)}</div>
              {invoice.currency === 'USD' && invoice.totalEurCents && (
                <p className="text-xs text-muted-foreground">{formatCurrency(invoice.totalEurCents, 'EUR')} EUR for tax purposes</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoice.status}</div>
              <p className="text-xs text-muted-foreground">
                {invoice.paidDate
                  ? `Paid on ${formatDate(invoice.paidDate)}`
                  : invoice.dueDate
                  ? `Due ${formatDate(invoice.dueDate)}`
                  : 'No due date set'}
              </p>
              {invoice.paymentMethod && (
                <p className="text-xs text-muted-foreground mt-1">
                  Payment method: {invoice.paymentMethod.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Information</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoice.vatRate > 0 ? `${invoice.vatRate}%` : 'No VAT'}</div>
              <p className="text-xs text-muted-foreground">{invoice.client.isUSClient ? 'US Client (No VAT)' : 'EU Client with IVA'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>From</CardTitle>
              <CardDescription>Your business details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{user.name || 'Demo Freelancer'}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.address && <p className="text-sm text-gray-600">{user.address}</p>}
                {user.taxId && <p className="text-sm text-gray-600">Tax ID: {user.taxId}</p>}
                {user.retaNumber && <p className="text-sm text-gray-600">RETA: {user.retaNumber}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
              <CardDescription>Client information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{invoice.client.name}</p>
                {invoice.client.email && <p className="text-sm text-gray-600">{invoice.client.email}</p>}
                {invoice.client.address && <p className="text-sm text-gray-600">{invoice.client.address}</p>}
                <p className="text-sm text-gray-600">{invoice.client.country}</p>
                {invoice.client.taxId && <p className="text-sm text-gray-600">Tax ID: {invoice.client.taxId}</p>}
                <div className="pt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.client.isUSClient ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {invoice.client.currency} Client
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Services and products on this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCurrency(item.unitPriceCents, invoice.currency)}</td>
                      <td className="text-right py-3">{formatCurrency(item.totalCents, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotalCents, invoice.currency)}</span>
              </div>

              {invoice.vatAmountCents > 0 && (
                <div className="flex justify-between">
                  <span>IVA ({invoice.vatRate}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.vatAmountCents, invoice.currency)}</span>
                </div>
              )}

              {invoice.withholdingAmountCents && (
                <div className="flex justify-between text-orange-600">
                  <span>Tax Withholding ({invoice.withholdingRate}%):</span>
                  <span className="font-medium">-{formatCurrency(invoice.withholdingAmountCents, invoice.currency)}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.totalCents, invoice.currency)}</span>
                </div>
              </div>

              {invoice.currency === 'USD' && invoice.totalEurCents && (
                <div className="text-sm text-gray-600 border-t pt-2">
                  <div className="flex justify-between">
                    <span>Total in EUR (Tax purposes):</span>
                    <span>{formatCurrency(invoice.totalEurCents, 'EUR')}</span>
                  </div>
                  {invoice.exchangeRate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Exchange rate: {invoice.exchangeRate.toFixed(4)} EUR/USD on {formatDate(invoice.date)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {(invoice.description || invoice.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.description && (
                <div>
                  <h4 className="font-medium mb-1">Description:</h4>
                  <p className="text-gray-600">{invoice.description}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h4 className="font-medium mb-1">Notes:</h4>
                  <p className="text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
