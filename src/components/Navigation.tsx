'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
            RETA Freelance Accounting
          </Link>
          <nav className="flex space-x-4">
            <Button variant={isActive('/') ? 'default' : 'ghost'} asChild>
              <Link href="/">Dashboard</Link>
            </Button>
            <Button variant={isActive('/clients') ? 'default' : 'ghost'} asChild>
              <Link href="/clients">Clients</Link>
            </Button>
            <Button variant={isActive('/invoices') ? 'default' : 'ghost'} asChild>
              <Link href="/invoices">Invoices</Link>
            </Button>
            <Button variant={isActive('/expenses') ? 'default' : 'ghost'} asChild>
              <Link href="/expenses">Expenses</Link>
            </Button>
            <Button variant={isActive('/calendar') ? 'default' : 'ghost'} asChild>
              <Link href="/calendar">Calendar</Link>
            </Button>
            <Button variant={isActive('/profile') ? 'default' : 'ghost'} asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}