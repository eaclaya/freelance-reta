'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickPaymentButtonProps {
  invoiceId: string
  currentStatus: string
  onStatusChange?: () => void
}

export function QuickPaymentButton({ 
  invoiceId, 
  currentStatus,
  onStatusChange 
}: QuickPaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const markAsPaid = async () => {
    if (!confirm('Mark this invoice as paid today?')) return
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PAID',
          paidDate: new Date().toISOString(),
          paymentMethod: 'bank_transfer' // Default method
        }),
      })

      if (response.ok) {
        onStatusChange?.()
        window.location.reload() // Refresh to show updated status
      } else {
        throw new Error('Failed to update invoice status')
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Failed to mark invoice as paid. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'PAID' || currentStatus === 'CANCELLED') {
    return null
  }

  return (
    <Button
      onClick={markAsPaid}
      disabled={loading}
      size="sm"
      variant="outline"
      title="Quick mark as paid (today)"
    >
      <CheckCircle className="h-4 w-4" />
      {loading && <span className="ml-1">...</span>}
    </Button>
  )
}