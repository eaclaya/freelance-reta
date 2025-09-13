'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadInvoicePDF } from '@/lib/pdf-generator'

interface InvoiceData {
  id: string
  number: string
  date: Date
  dueDate?: Date | null
  status: string
  description?: string | null
  notes?: string | null
  subtotalCents: number
  vatRate: number
  vatAmountCents: number
  totalCents: number
  currency: string
  exchangeRate?: number | null
  totalEurCents?: number | null
  withholdingRate?: number | null
  withholdingAmountCents?: number | null
  paidDate?: Date | null
  client: {
    name: string
    email?: string | null
    address?: string | null
    country: string
    taxId?: string | null
    isUSClient: boolean
  }
  items: Array<{
    description: string
    quantity: number
    unitPriceCents: number
    totalCents: number
  }>
}

interface UserData {
  name?: string | null
  email: string
  address?: string | null
  taxId?: string | null
  retaNumber?: string | null
}

interface InvoicePDFDownloadProps {
  invoice: InvoiceData
  user: UserData
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function InvoicePDFDownload({ 
  invoice, 
  user, 
  variant = 'outline',
  size = 'default'
}: InvoicePDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      downloadInvoicePDF(invoice, user)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleDownload}
      disabled={isGenerating}
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  )
}