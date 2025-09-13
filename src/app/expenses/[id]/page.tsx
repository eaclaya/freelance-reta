import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Receipt, Euro, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ExpenseDetailPageProps {
  params: {
    id: string
  }
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
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
    notFound()
  }

  const getCategoryDisplayName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      'OFFICE_SUPPLIES': 'bg-blue-100 text-blue-800',
      'EQUIPMENT': 'bg-purple-100 text-purple-800',
      'SOFTWARE': 'bg-indigo-100 text-indigo-800',
      'PROFESSIONAL_SERVICES': 'bg-green-100 text-green-800',
      'TRAVEL': 'bg-yellow-100 text-yellow-800',
      'MEALS': 'bg-orange-100 text-orange-800',
      'INTERNET': 'bg-cyan-100 text-cyan-800',
      'PHONE': 'bg-pink-100 text-pink-800',
      'RENT': 'bg-red-100 text-red-800',
      'UTILITIES': 'bg-gray-100 text-gray-800',
      'INSURANCE': 'bg-emerald-100 text-emerald-800',
      'EDUCATION': 'bg-violet-100 text-violet-800',
      'MARKETING': 'bg-rose-100 text-rose-800',
      'OTHER': 'bg-slate-100 text-slate-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

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
              <Button variant="ghost" asChild>
                <a href="/invoices">Invoices</a>
              </Button>
              <Button variant="default" asChild>
                <a href="/expenses">Expenses</a>
              </Button>
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
              <a href="/expenses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Expenses
              </a>
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{expense.description}</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeColor(expense.category)}`}>
                  {getCategoryDisplayName(expense.category)}
                </span>
                <span className="text-gray-600">{formatDate(expense.date)}</span>
                {!expense.isDeductible && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Not Tax Deductible
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <a href={`/expenses/${expense.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(expense.amountCents, expense.currency)}
              </div>
              {expense.currency === 'USD' && expense.amountEurCents && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(expense.amountEurCents, 'EUR')} EUR for tax purposes
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(expense.date)}</div>
              <p className="text-xs text-muted-foreground">
                Expense date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expense.isDeductible ? 'Deductible' : 'Not Deductible'}
              </div>
              <p className="text-xs text-muted-foreground">
                Tax deduction status
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Complete information about this expense</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-900">{expense.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(expense.category)}`}>
                  {getCategoryDisplayName(expense.category)}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Currency</h4>
                <p className="text-gray-900">{expense.currency}</p>
              </div>

              {expense.exchangeRate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Exchange Rate</h4>
                  <p className="text-gray-900">{expense.exchangeRate.toFixed(4)} EUR/{expense.currency}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Tax Deductible</h4>
                <p className="text-gray-900">{expense.isDeductible ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>VAT and tax-related details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(expense.amountCents, expense.currency)}
                  </span>
                </div>
                
                {expense.vatRate && expense.vatAmountCents && (
                  <div className="flex justify-between">
                    <span>VAT ({expense.vatRate}%):</span>
                    <span className="font-medium">
                      {formatCurrency(expense.vatAmountCents, expense.currency)}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>
                      {formatCurrency(
                        expense.amountCents + (expense.vatAmountCents || 0), 
                        expense.currency
                      )}
                    </span>
                  </div>
                </div>
                
                {expense.currency === 'USD' && expense.amountEurCents && (
                  <div className="text-sm text-gray-600 border-t pt-2">
                    <div className="flex justify-between">
                      <span>Amount in EUR (Tax purposes):</span>
                      <span>{formatCurrency(expense.amountEurCents, 'EUR')}</span>
                    </div>
                    {expense.exchangeRate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Exchange rate: {expense.exchangeRate.toFixed(4)} EUR/USD on {formatDate(expense.date)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {expense.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{expense.notes}</p>
            </CardContent>
          </Card>
        )}

        {expense.receipt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-4 w-4" />
                Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Receipt: {expense.receipt}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}