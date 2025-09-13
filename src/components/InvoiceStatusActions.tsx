'use client'

import { useState } from 'react'
import { Send, CheckCircle, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InvoiceStatusActionsProps {
  invoiceId: string
  currentStatus: string
  onStatusChange?: () => void
}

export function InvoiceStatusActions({ 
  invoiceId, 
  currentStatus, 
  onStatusChange 
}: InvoiceStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('')

  const updateInvoiceStatus = async (status: string, paidDate?: string, method?: string) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          paidDate: paidDate ? new Date(paidDate).toISOString() : null,
          paymentMethod: method || null
        }),
      })

      if (response.ok) {
        onStatusChange?.()
        setShowPaymentForm(false)
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        throw new Error('Failed to update invoice status')
      }
    } catch (error) {
      console.error('Error updating invoice status:', error)
      alert('Failed to update invoice status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async () => {
    await updateInvoiceStatus('PAID', paymentDate, paymentMethod)
  }

  const handleSendInvoice = async () => {
    await updateInvoiceStatus('SENT')
  }

  const handleMarkOverdue = async () => {
    await updateInvoiceStatus('OVERDUE')
  }

  const handleCancelInvoice = async () => {
    if (confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
      await updateInvoiceStatus('CANCELLED')
    }
  }

  if (currentStatus === 'PAID') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Invoice Paid</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 flex-wrap">
        {currentStatus === 'DRAFT' && (
          <Button
            onClick={handleSendInvoice}
            disabled={loading}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        )}

        {(currentStatus === 'SENT' || currentStatus === 'OVERDUE') && (
          <>
            <Button
              onClick={() => setShowPaymentForm(true)}
              disabled={loading}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
            
            {currentStatus === 'SENT' && (
              <Button
                onClick={handleMarkOverdue}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Overdue
              </Button>
            )}
          </>
        )}

        {currentStatus !== 'CANCELLED' && currentStatus !== 'PAID' && (
          <Button
            onClick={handleCancelInvoice}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {showPaymentForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Record Payment</CardTitle>
            <CardDescription>
              Enter the payment details to mark this invoice as paid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select payment method...</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wire_transfer">Wire Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="wise">Wise</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAsPaid}
                disabled={loading || !paymentDate}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}