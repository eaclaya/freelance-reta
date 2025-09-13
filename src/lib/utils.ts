import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amountInCents: number, currency: string = 'EUR') {
  const amount = amountInCents / 100
  
  // Use appropriate locale based on currency for proper symbol placement
  const locale = currency === 'USD' ? 'en-US' : 'es-ES'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES').format(date)
}

export function getQuarterDates(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3
  const endMonth = startMonth + 2
  
  return {
    start: new Date(year, startMonth, 1),
    end: new Date(year, endMonth + 1, 0)
  }
}

export function getTaxDeadlines(year: number) {
  return {
    Q1: new Date(year, 3, 20), // April 20
    Q2: new Date(year, 6, 20), // July 20  
    Q3: new Date(year, 9, 20), // October 20
    Q4: new Date(year + 1, 0, 30), // January 30 next year
    ANNUAL: new Date(year + 1, 5, 30) // June 30 next year
  }
}

export async function getCurrentExchangeRate(): Promise<number> {
  try {
    const response = await fetch('/api/exchange-rate')
    const result = await response.json()
    
    if (result.success) {
      return result.data.rate
    } else {
      console.warn('Failed to fetch current exchange rate, using fallback')
      return 0.85
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return 0.85
  }
}

export function convertCurrencyAmount(
  amountInCents: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amountInCents
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'EUR') {
    return Math.round(amountInCents * exchangeRate)
  }
  
  if (fromCurrency === 'EUR' && toCurrency === 'USD') {
    return Math.round(amountInCents / exchangeRate)
  }
  
  return amountInCents
}