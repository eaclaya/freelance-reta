'use client'

import { useEffect, useState } from 'react'
import { generateSpanishTaxReminders, generateMonthlyInvoiceReminders, type TaxReminder } from '@/lib/spanish-tax-reminders'

interface SpanishTaxCalendarProps {
  invoices?: Array<{
    id: string
    number: string
    dueDate: Date | null
    status: string
    client: { name: string }
  }>
  expenses?: Array<{
    id: string
    date: Date
    amountCents: number
  }>
}

export function SpanishTaxCalendar({ invoices = [], expenses = [] }: SpanishTaxCalendarProps) {
  const [reminders, setReminders] = useState<TaxReminder[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Generate reminders for current and next year
    const currentYear = new Date().getFullYear()
    const taxReminders = [
      ...generateSpanishTaxReminders(currentYear),
      ...generateSpanishTaxReminders(currentYear + 1),
      ...generateMonthlyInvoiceReminders(currentYear),
      ...generateMonthlyInvoiceReminders(currentYear + 1)
    ]
    
    setReminders(taxReminders)
  }, [invoices, expenses])

  const getCalendarId = (category: string): string => {
    switch (category) {
      case 'modelo130':
      case 'modelo303':
      case 'modelo100':
      case 'modelo390':
        return 'tax-deadlines'
      case 'invoice':
        return 'invoice-reminders'
      case 'reta':
        return 'reta-payments'
      default:
        return 'payment-due'
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'modelo130':
      case 'modelo303':
      case 'modelo100':
      case 'modelo390':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'invoice':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reta':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '🚨'
      case 'medium':
        return '⚠️'
      case 'low':
        return 'ℹ️'
      default:
        return '📅'
    }
  }

  // Simple calendar grid generator
  const generateCalendarGrid = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getDayReminders = (day: number) => {
    if (!day) return []
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date)
      return reminderDate.toDateString() === dayDate.toDateString()
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const days = generateCalendarGrid(currentDate)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span className="text-sm font-medium">Tax Deadlines</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span className="text-sm font-medium">Invoice Reminders</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span className="text-sm font-medium">RETA Payments</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-400 rounded"></div>
          <span className="text-sm font-medium">Payment Due</span>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          ← Previous
        </button>
        <h3 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayReminders = getDayReminders(day)
            const isToday = day && 
              new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  !day ? 'bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayReminders.slice(0, 3).map(reminder => (
                        <div
                          key={reminder.id}
                          className={`text-xs p-1 rounded truncate ${getCategoryColor(reminder.category)}`}
                          title={reminder.title}
                        >
                          {reminder.title.length > 15 ? reminder.title.substring(0, 15) + '...' : reminder.title}
                        </div>
                      ))}
                      {dayReminders.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayReminders.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming reminders list */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reminders (Next 30 Days)</h3>
        <div className="space-y-3">
          {reminders
            .filter(reminder => {
              const now = new Date()
              const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
              return reminder.date >= now && reminder.date <= thirtyDaysFromNow
            })
            .slice(0, 10)
            .map(reminder => (
              <div key={reminder.id} className={`p-4 rounded-lg border ${getCategoryColor(reminder.category)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getPriorityIcon(reminder.priority)}</span>
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm opacity-90 mt-1">{reminder.description}</p>
                      <p className="text-xs opacity-75 mt-2">
                        {reminder.date.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}