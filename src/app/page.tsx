import { Calendar, DollarSign, FileText, TrendingUp, Users, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ExchangeRateWidget } from "@/components/ExchangeRateWidget"
import { ProfileSummary } from "@/components/ProfileSummary"

export default function Dashboard() {
  const currentYear = new Date().getFullYear()
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">RETA Freelance Accounting</h1>
            <nav className="flex space-x-4">
              <Button variant="default">Dashboard</Button>
              <Button variant="ghost" asChild>
                <a href="/clients">Clients</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/invoices">Invoices</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/expenses">Expenses</a>
              </Button>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of your freelance business for {currentYear} Q{currentQuarter}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">
                This quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">
                0 pending invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quarterly Tax Owed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">
                Modelo 130 estimate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                This quarter
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest invoicing activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No invoices created yet
              </div>
              <Button className="w-full mt-4">Create First Invoice</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tax Deadlines</CardTitle>
              <CardDescription>Important dates for Spanish RETA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-900">Q{currentQuarter} Modelo 130</p>
                      <p className="text-sm text-orange-700">Quarterly Income Tax</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-900">
                      {currentQuarter === 1 && "Apr 20"}
                      {currentQuarter === 2 && "Jul 20"}
                      {currentQuarter === 3 && "Oct 20"}
                      {currentQuarter === 4 && "Jan 20"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">Q{currentQuarter} Modelo 303</p>
                      <p className="text-sm text-blue-700">Quarterly VAT Return</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-900">
                      {currentQuarter === 1 && "Apr 20"}
                      {currentQuarter === 2 && "Jul 20"}
                      {currentQuarter === 3 && "Oct 20"}
                      {currentQuarter === 4 && "Jan 20"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <a href="/invoices/new">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Invoice
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/clients/new">
                  <Users className="mr-2 h-4 w-4" />
                  Add Client
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Record Expense
              </Button>
            </CardContent>
          </Card>

          <ExchangeRateWidget />

          <ProfileSummary />

          <Card>
            <CardHeader>
              <CardTitle>RETA Status</CardTitle>
              <CardDescription>Your autonomo status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">RETA Registration</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Rate</span>
                  <span className="text-sm font-medium">Standard</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Payment</span>
                  <span className="text-sm font-medium">End of month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
