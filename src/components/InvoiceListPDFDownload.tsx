'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadInvoicePDF } from '@/lib/pdf-generator'

interface InvoiceListPDFDownloadProps {
  invoiceId: string
}

export function InvoiceListPDFDownload({ invoiceId }: InvoiceListPDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      // Fetch the complete invoice data
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data')
      }
      
      const { invoice } = await response.json()
      
      // Fetch user data
      const userResponse = await fetch('/api/profile')
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }
      
      const { user } = await userResponse.json()
      
      // Generate and download PDF
      downloadInvoicePDF(invoice, user)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload}
      disabled={isGenerating}
      title={error || undefined}
    >
      <Download className="h-4 w-4" />
      {isGenerating && <span className="ml-1">...</span>}
    </Button>
  )
}