import { Receipt, Plus, Search, TrendingDown, Euro, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function ExpensesPage() {
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

  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + (expense.currency === 'EUR' ? expense.amountCents : expense.amountEurCents || 0)
  }, 0)

  const deductibleExpenses = expenses.filter(expense => expense.isDeductible)
  const totalDeductible = deductibleExpenses.reduce((sum, expense) => {
    return sum + (expense.currency === 'EUR' ? expense.amountCents : expense.amountEurCents || 0)
  }, 0)

  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear()
  })

  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => {
    return sum + (expense.currency === 'EUR' ? expense.amountCents : expense.amountEurCents || 0)
  }, 0)

  const categorySummary = expenses.reduce((acc, expense) => {
    const amount = expense.currency === 'EUR' ? expense.amountCents : expense.amountEurCents || 0
    acc[expense.category] = (acc[expense.category] || 0) + amount
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categorySummary).sort(([,a], [,b]) => b - a)[0]

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
              <Button variant="default">Expenses</Button>
              <Button variant="ghost">Reports</Button>
              <Button variant="ghost" asChild>
                <a href="/calendar">Calendar</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/profile">Profile</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h2>
            <p className="text-gray-600">Track your business expenses and maximize tax deductions</p>
          </div>
          <Button asChild>
            <a href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </a>
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search expenses by description, category, or amount..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} total expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDeductible)}</div>
              <p className="text-xs text-muted-foreground">
                {deductibleExpenses.length} deductible expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(thisMonthTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthExpenses.length} expenses this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topCategory ? getCategoryDisplayName(topCategory[0]) : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {topCategory ? formatCurrency(topCategory[1]) : 'No expenses yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {expenses.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                <p className="text-gray-500 mb-6">
                  Start tracking your business expenses to maximize tax deductions and better manage your finances.
                </p>
                <Button asChild>
                  <a href="/expenses/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Expense
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{expense.description}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(expense.category)}`}>
                            {getCategoryDisplayName(expense.category)}
                          </span>
                          {!expense.isDeductible && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Not Deductible
                            </span>
                          )}
                          {expense.vatRate && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {expense.vatRate}% VAT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(expense.amountCents, expense.currency)}
                        </p>
                        {expense.currency === 'USD' && expense.amountEurCents && (
                          <p className="text-sm text-gray-500">
                            {formatCurrency(expense.amountEurCents, 'EUR')} EUR
                          </p>
                        )}
                        {expense.vatAmountCents && (
                          <p className="text-xs text-blue-600">
                            +{formatCurrency(expense.vatAmountCents, expense.currency)} VAT
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/expenses/${expense.id}`}>View</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/expenses/${expense.id}/edit`}>Edit</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {expense.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">{expense.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}