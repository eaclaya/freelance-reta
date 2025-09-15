import { FileText, Plus, Search, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceListPDFDownload } from "@/components/InvoiceListPDFDownload"
import { QuickPaymentButton } from "@/components/QuickPaymentButton"

export default async function InvoicesPage() {
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

  const totalInvoiced = invoices.reduce((sum, invoice) => {
    return sum + (invoice.currency === 'EUR' ? invoice.totalCents : invoice.totalEurCents || 0)
  }, 0)

  const pendingInvoices = invoices.filter(invoice => 
    invoice.status === 'SENT' || invoice.status === 'OVERDUE'
  )

  const pendingAmount = pendingInvoices.reduce((sum, invoice) => {
    return sum + (invoice.currency === 'EUR' ? invoice.totalCents : invoice.totalEurCents || 0)
  }, 0)

  const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID')

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h2>
            <p className="text-gray-600">Manage your invoices and track payments</p>
          </div>
          <Button asChild>
            <a href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </a>
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search invoices by number, client, or amount..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
              <p className="text-xs text-muted-foreground">
                {invoices.length} total invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidInvoices.length}</div>
              <p className="text-xs text-muted-foreground">
                Successfully paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Quarter</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(inv => {
                  const quarter = Math.ceil((new Date(inv.date).getMonth() + 1) / 3)
                  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
                  return quarter === currentQuarter && new Date(inv.date).getFullYear() === new Date().getFullYear()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Current quarter
              </p>
            </CardContent>
          </Card>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first invoice to start tracking payments and managing your business finances.
                </p>
                <Button asChild>
                  <a href="/invoices/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Invoice
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">#{invoice.number}</h3>
                        <p className="text-gray-600">{invoice.client.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(invoice.totalCents, invoice.currency)}
                        </p>
                        {invoice.currency === 'USD' && invoice.totalEurCents && (
                          <p className="text-sm text-gray-500">
                            {formatCurrency(invoice.totalEurCents, 'EUR')} EUR
                          </p>
                        )}
                        {invoice.withholdingAmountCents && (
                          <p className="text-xs text-orange-600">
                            -{formatCurrency(invoice.withholdingAmountCents, invoice.currency)} withheld
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/invoices/${invoice.id}`}>View</a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/invoices/${invoice.id}/edit`}>Edit</a>
                          </Button>
                          <QuickPaymentButton 
                            invoiceId={invoice.id}
                            currentStatus={invoice.status}
                          />
                          <InvoiceListPDFDownload invoiceId={invoice.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}