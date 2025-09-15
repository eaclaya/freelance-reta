import { Calendar as CalendarIcon, Bell, FileText, Euro, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { SpanishTaxCalendar } from "@/components/SpanishTaxCalendar"
import { SeedRemindersButton } from "@/components/SeedRemindersButton"

export default async function CalendarPage() {
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

  // Fetch relevant data for reminders
  const invoices = await prisma.invoice.findMany({
    where: { 
      userId: user.id,
      status: { in: ['SENT', 'OVERDUE'] }
    },
    include: { client: true },
    orderBy: { dueDate: 'asc' }
  })

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 10
  })

  const reminders = await prisma.reminder.findMany({
    where: { 
      userId: user.id,
      completed: false
    },
    orderBy: { date: 'asc' }
  })

  // Get upcoming deadlines (next 7 days)
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const upcomingInvoices = invoices.filter(invoice => 
    invoice.dueDate && new Date(invoice.dueDate) <= nextWeek
  )

  const upcomingReminders = reminders.filter(reminder => 
    new Date(reminder.date) <= nextWeek
  )

  // Calculate some stats
  const overdueInvoices = invoices.filter(invoice => 
    invoice.dueDate && new Date(invoice.dueDate) < now
  )

  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear()
  })

  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3)
  const nextTaxDeadline = getNextTaxDeadline()

  function getNextTaxDeadline() {
    const currentYear = now.getFullYear()
    const deadlines = [
      { name: 'Modelo 130 Q1', date: new Date(currentYear, 3, 20) },
      { name: 'Modelo 303 Q1', date: new Date(currentYear, 3, 20) },
      { name: 'Modelo 130 Q2', date: new Date(currentYear, 6, 20) },
      { name: 'Modelo 303 Q2', date: new Date(currentYear, 6, 20) },
      { name: 'Modelo 130 Q3', date: new Date(currentYear, 9, 20) },
      { name: 'Modelo 303 Q3', date: new Date(currentYear, 9, 20) },
      { name: 'Modelo 130 Q4', date: new Date(currentYear + 1, 0, 20) },
      { name: 'Modelo 303 Q4', date: new Date(currentYear + 1, 0, 20) },
      { name: 'Modelo 100', date: new Date(currentYear + 1, 5, 30) },
      { name: 'Modelo 390', date: new Date(currentYear + 1, 0, 30) },
    ]

    return deadlines
      .filter(deadline => deadline.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendar & Reminders</h2>
            <p className="text-gray-600">Spanish tax deadlines, invoice reminders, and payment tracking</p>
          </div>
          {reminders.length === 0 && (
            <SeedRemindersButton />
          )}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Tax Deadline</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextTaxDeadline ? nextTaxDeadline.name : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextTaxDeadline ? 
                  nextTaxDeadline.date.toLocaleDateString('es-ES') : 
                  'All up to date'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reminders</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingReminders.length}</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Due Dates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingInvoices.length}</div>
              <p className="text-xs text-muted-foreground">
                {overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue` : 'All up to date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Quarter</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Q{currentQuarter} {now.getFullYear()}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthExpenses.length} expenses this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Alerts */}
        {(overdueInvoices.length > 0 || upcomingReminders.length > 0) && (
          <div className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Urgent Items Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueInvoices.map(invoice => (
                    <div key={invoice.id} className="text-red-700 text-sm">
                      📄 Invoice #{invoice.number} for {invoice.client.name} is overdue (Due: {new Date(invoice.dueDate!).toLocaleDateString()})
                    </div>
                  ))}
                  {upcomingReminders.slice(0, 3).map(reminder => (
                    <div key={reminder.id} className="text-red-700 text-sm">
                      {reminder.type === 'TAX_FILING' ? '📋' : '💰'} {reminder.title} - {new Date(reminder.date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Spanish Tax & Business Calendar</CardTitle>
            <CardDescription>
              Automatically generated reminders for Spanish tax deadlines, invoice due dates, and RETA payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpanishTaxCalendar invoices={invoices} expenses={expenses} />
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Spanish Tax Calendar Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <h4 className="font-medium text-red-800">Quarterly Deadlines (High Priority)</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
                  <li>Modelo 130 (IRPF): Jan 20, Apr 20, Jul 20, Oct 20</li>
                  <li>Modelo 303 (VAT): Jan 20, Apr 20, Jul 20, Oct 20</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800">Annual Deadlines</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
                  <li>Modelo 100 (Annual IRPF): June 30</li>
                  <li>Modelo 390 (Annual VAT): January 30</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-green-800">Quarterly RETA</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
                  <li>Social Security payments: Filed with tax documents on 20th</li>
                  <li>Variable amount based on contribution base</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automated Reminders</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <h4 className="font-medium text-blue-800">Invoice Management</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
                  <li>Monthly invoice generation (1st of each month)</li>
                  <li>Payment due date tracking</li>
                  <li>Overdue payment alerts</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-800">Tax Preparation</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mt-1">
                  <li>7-day advance warnings for tax deadlines</li>
                  <li>Quarterly expense reconciliation reminders</li>
                  <li>Annual tax preparation notifications</li>
                </ul>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                All dates are automatically calculated based on Spanish tax law. Consult your tax advisor for specific requirements.
              </p>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}