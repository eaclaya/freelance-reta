export interface TaxReminder {
  id: string
  title: string
  description: string
  type: 'TAX_FILING' | 'INVOICE_DUE' | 'PAYMENT_RECEIVED' | 'EXPENSE_DEADLINE' | 'RETA_PAYMENT' | 'GENERAL'
  date: Date
  recurring: boolean
  frequency?: 'QUARTERLY' | 'MONTHLY' | 'YEARLY'
  category: 'modelo130' | 'modelo303' | 'modelo100' | 'modelo390' | 'reta' | 'invoice' | 'general'
  priority: 'high' | 'medium' | 'low'
}

export function generateSpanishTaxReminders(year: number): TaxReminder[] {
  const reminders: TaxReminder[] = []
  
  // Modelo 130 - Quarterly Personal Income Tax (IRPF)
  // Due dates: April 30, July 30, October 30, January 30
  const modelo130Quarters = [
    { quarter: 'Q1', month: 3, day: 30, name: 'Q1 (Jan-Mar)' }, // April 30 for Q1
    { quarter: 'Q2', month: 6, day: 30, name: 'Q2 (Apr-Jun)' }, // July 30 for Q2
    { quarter: 'Q3', month: 9, day: 30, name: 'Q3 (Jul-Sep)' }, // October 30 for Q3
    { quarter: 'Q4', month: 0, day: 30, name: 'Q4 (Oct-Dec)' }   // January 30 of next year for Q4
  ]

  modelo130Quarters.forEach(({ quarter, month, day, name }) => {
    const dueYear = quarter === 'Q4' ? year + 1 : year
    const dueMonth = quarter === 'Q4' ? 0 : month // January is month 0
    
    reminders.push({
      id: `modelo130-${quarter}-${year}`,
      title: `Modelo 130 - ${name}`,
      description: `Quarterly personal income tax declaration for ${name}. Calculate and pay IRPF for autonomous workers.`,
      type: 'TAX_FILING',
      date: new Date(dueYear, dueMonth, day),
      recurring: false,
      category: 'modelo130',
      priority: 'high'
    })

    // Add reminder 7 days before due date
    reminders.push({
      id: `modelo130-${quarter}-${year}-reminder`,
      title: `⚠️ Modelo 130 Due Soon - ${name}`,
      description: `Reminder: Modelo 130 is due in 7 days. Prepare your quarterly income tax declaration.`,
      type: 'TAX_FILING',
      date: new Date(dueYear, dueMonth, day - 7),
      recurring: false,
      category: 'modelo130',
      priority: 'high'
    })
  })

  // Modelo 303 - Quarterly VAT (IVA)
  // Due dates: April 30, July 30, October 30, January 30
  const modelo303Quarters = [
    { quarter: 'Q1', month: 3, day: 30, name: 'Q1 (Jan-Mar)' },
    { quarter: 'Q2', month: 6, day: 30, name: 'Q2 (Apr-Jun)' },
    { quarter: 'Q3', month: 9, day: 30, name: 'Q3 (Jul-Sep)' },
    { quarter: 'Q4', month: 0, day: 30, name: 'Q4 (Oct-Dec)' }
  ]

  modelo303Quarters.forEach(({ quarter, month, day, name }) => {
    const dueYear = quarter === 'Q4' ? year + 1 : year
    const dueMonth = quarter === 'Q4' ? 0 : month
    
    reminders.push({
      id: `modelo303-${quarter}-${year}`,
      title: `Modelo 303 - VAT ${name}`,
      description: `Quarterly VAT (IVA) declaration for ${name}. Report input and output VAT.`,
      type: 'TAX_FILING',
      date: new Date(dueYear, dueMonth, day),
      recurring: false,
      category: 'modelo303',
      priority: 'high'
    })

    reminders.push({
      id: `modelo303-${quarter}-${year}-reminder`,
      title: `⚠️ Modelo 303 Due Soon - ${name}`,
      description: `Reminder: VAT declaration is due in 7 days. Calculate your quarterly IVA.`,
      type: 'TAX_FILING',
      date: new Date(dueYear, dueMonth, day - 7),
      recurring: false,
      category: 'modelo303',
      priority: 'high'
    })
  })

  // Modelo 100 - Annual Income Tax (IRPF)
  // Due date: June 30
  reminders.push({
    id: `modelo100-${year}`,
    title: `Modelo 100 - Annual Income Tax ${year}`,
    description: `Annual personal income tax declaration for ${year}. Comprehensive IRPF filing including all income sources.`,
    type: 'TAX_FILING',
    date: new Date(year + 1, 5, 30), // June 30 of next year
    recurring: false,
    category: 'modelo100',
    priority: 'high'
  })

  reminders.push({
    id: `modelo100-${year}-reminder`,
    title: `⚠️ Annual Tax Declaration Due Soon`,
    description: `Reminder: Modelo 100 annual tax declaration is due in 14 days. Gather all documents.`,
    type: 'TAX_FILING',
    date: new Date(year + 1, 5, 16), // June 16
    recurring: false,
    category: 'modelo100',
    priority: 'high'
  })

  // Modelo 390 - Annual VAT Summary
  // Due date: January 30
  reminders.push({
    id: `modelo390-${year}`,
    title: `Modelo 390 - Annual VAT Summary ${year}`,
    description: `Annual VAT summary declaration for ${year}. Reconcile quarterly VAT payments with annual totals.`,
    type: 'TAX_FILING',
    date: new Date(year + 1, 0, 30), // January 30 of next year
    recurring: false,
    category: 'modelo390',
    priority: 'medium'
  })

  // RETA Monthly Payments
  // Due date: 30th of each month
  for (let month = 0; month < 12; month++) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    reminders.push({
      id: `reta-${year}-${month}`,
      title: `RETA Payment - ${monthNames[month]} ${year}`,
      description: `Monthly RETA (Social Security) payment for autonomous workers. Amount varies based on contribution base.`,
      type: 'RETA_PAYMENT',
      date: new Date(year, month, 30),
      recurring: false,
      category: 'reta',
      priority: 'medium'
    })

    // Reminder 3 days before
    reminders.push({
      id: `reta-${year}-${month}-reminder`,
      title: `RETA Payment Due Soon - ${monthNames[month]}`,
      description: `Reminder: RETA payment is due in 3 days. Check your contribution amount.`,
      type: 'RETA_PAYMENT',
      date: new Date(year, month, 27),
      recurring: false,
      category: 'reta',
      priority: 'medium'
    })
  }

  return reminders.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function generateMonthlyInvoiceReminders(year: number): TaxReminder[] {
  const reminders: TaxReminder[] = []
  
  // Monthly invoice generation reminders
  // Suggest 1st of each month
  for (let month = 0; month < 12; month++) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    reminders.push({
      id: `invoice-monthly-${year}-${month}`,
      title: `📄 Generate Monthly Invoices - ${monthNames[month]} ${year}`,
      description: `Time to create and send invoices for ${monthNames[month]}. Review completed work and bill your clients.`,
      type: 'INVOICE_DUE',
      date: new Date(year, month, 1),
      recurring: false,
      category: 'invoice',
      priority: 'high'
    })
  }

  return reminders
}

export function generatePaymentDueReminders(invoices: Array<{
  id: string
  number: string
  dueDate: Date | null
  status: string
  client: { name: string }
}>): TaxReminder[] {
  const reminders: TaxReminder[] = []
  
  invoices.forEach(invoice => {
    if (invoice.dueDate && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED') {
      const dueDate = new Date(invoice.dueDate)
      
      // Reminder 7 days before due date
      reminders.push({
        id: `payment-due-${invoice.id}-7days`,
        title: `💰 Payment Due Soon - Invoice #${invoice.number}`,
        description: `Invoice #${invoice.number} for ${invoice.client.name} is due in 7 days (${dueDate.toLocaleDateString()}).`,
        type: 'PAYMENT_RECEIVED',
        date: new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        recurring: false,
        category: 'invoice',
        priority: 'medium'
      })

      // Reminder on due date
      reminders.push({
        id: `payment-due-${invoice.id}-today`,
        title: `⏰ Payment Due Today - Invoice #${invoice.number}`,
        description: `Invoice #${invoice.number} for ${invoice.client.name} is due today. Follow up if payment not received.`,
        type: 'PAYMENT_RECEIVED',
        date: dueDate,
        recurring: false,
        category: 'invoice',
        priority: 'high'
      })

      // Overdue reminder 3 days after due date
      reminders.push({
        id: `payment-overdue-${invoice.id}-3days`,
        title: `🚨 Payment Overdue - Invoice #${invoice.number}`,
        description: `Invoice #${invoice.number} for ${invoice.client.name} is 3 days overdue. Consider sending a reminder or follow-up.`,
        type: 'PAYMENT_RECEIVED',
        date: new Date(dueDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        recurring: false,
        category: 'invoice',
        priority: 'high'
      })
    }
  })

  return reminders
}