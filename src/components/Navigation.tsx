import { Button } from '@/components/ui/button'

interface NavigationProps {
  currentPage?: 'dashboard' | 'clients' | 'invoices' | 'expenses' | 'reports' | 'calendar' | 'profile'
}

export function Navigation({ currentPage = 'dashboard' }: NavigationProps) {
  const isActive = (page: string) => currentPage === page

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">RETA Freelance Accounting</h1>
          <nav className="flex space-x-4">
            <Button variant={isActive('dashboard') ? 'default' : 'ghost'} asChild>
              <a href="/">Dashboard</a>
            </Button>
            <Button variant={isActive('clients') ? 'default' : 'ghost'} asChild>
              <a href="/clients">Clients</a>
            </Button>
            <Button variant={isActive('invoices') ? 'default' : 'ghost'}>
              Invoices
            </Button>
            <Button variant={isActive('expenses') ? 'default' : 'ghost'}>
              Expenses
            </Button>
            <Button variant={isActive('reports') ? 'default' : 'ghost'}>
              Reports
            </Button>
            <Button variant={isActive('calendar') ? 'default' : 'ghost'}>
              Calendar
            </Button>
            <Button variant={isActive('profile') ? 'default' : 'ghost'} asChild>
              <a href="/profile">Profile</a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}