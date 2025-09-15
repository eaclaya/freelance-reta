'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { formatCurrency } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string | null
  country: string
  currency: string
  isUSClient: boolean
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  const { exchangeRate } = useExchangeRate()

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ])
  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setClients(result.clients)
            
            // Pre-select client if clientId is provided
            if (clientId) {
              const client = result.clients.find((c: Client) => c.id === clientId)
              if (client) {
                setSelectedClient(client)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchClients()

    // Generate invoice number
    const now = new Date()
    const invoiceNumber = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    setFormData(prev => ({ ...prev, number: invoiceNumber }))
  }, [clientId])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateVAT = () => {
    const subtotal = calculateSubtotal()
    if (!selectedClient?.isUSClient) {
      return subtotal * 0.21 // 21% IVA for EU clients
    }
    return 0 // No VAT for US clients
  }

  const calculateWithholding = () => {
    const subtotal = calculateSubtotal()
    if (!selectedClient?.isUSClient) {
      return subtotal * 0.15 // 15% withholding for Spanish clients
    }
    return 0 // No withholding for US clients
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT()
  }

  const calculateTotalEUR = () => {
    if (selectedClient?.currency === 'USD' && exchangeRate) {
      return calculateTotal() * exchangeRate.rate
    }
    return calculateTotal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) {
      alert('Please select a client')
      return
    }

    setLoading(true)

    try {
      const subtotalCents = Math.round(calculateSubtotal() * 100)
      const vatAmountCents = Math.round(calculateVAT() * 100)
      const totalCents = Math.round(calculateTotal() * 100)
      const withholdingAmountCents = Math.round(calculateWithholding() * 100)
      const totalEurCents = selectedClient.currency === 'USD' && exchangeRate
        ? Math.round(calculateTotalEUR() * 100)
        : totalCents

      const invoiceData = {
        number: formData.number,
        date: new Date(formData.date).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        clientId: selectedClient.id,
        description: formData.description || null,
        notes: formData.notes || null,
        subtotalCents,
        vatRate: selectedClient.isUSClient ? 0 : 21,
        vatAmountCents,
        totalCents,
        currency: selectedClient.currency,
        exchangeRate: selectedClient.currency === 'USD' && exchangeRate ? exchangeRate.rate : null,
        totalEurCents: selectedClient.currency === 'USD' ? totalEurCents : null,
        withholdingRate: selectedClient.isUSClient ? null : 15,
        withholdingAmountCents: selectedClient.isUSClient ? null : withholdingAmountCents,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.unitPrice * 100),
          totalCents: Math.round(item.quantity * item.unitPrice * 100)
        }))
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/invoices/${result.invoice.id}`)
      } else {
        throw new Error('Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Invoice</h2>
            <p className="text-gray-600">Generate a professional invoice with Spanish tax compliance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Invoice Number</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Invoice Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of services"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or terms"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="client">Select Client</Label>
                  <select
                    id="client"
                    value={selectedClient?.id || ''}
                    onChange={(e) => {
                      const client = clients.find(c => c.id === e.target.value)
                      setSelectedClient(client || null)
                    }}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.currency} - {client.country})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClient && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{selectedClient.name}</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Country:</strong> {selectedClient.country}</p>
                      <p><strong>Currency:</strong> {selectedClient.currency}</p>
                      <p><strong>Type:</strong> {selectedClient.isUSClient ? 'US Client (No VAT)' : 'EU Client (21% IVA)'}</p>
                      {selectedClient.email && (
                        <p><strong>Email:</strong> {selectedClient.email}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>Add services or products to this invoice</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service or product description"
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label>Unit Price ({selectedClient?.currency || 'EUR'})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label>Total</Label>
                      <div className="text-sm font-medium py-2">
                        {formatCurrency((item.quantity * item.unitPrice) * 100, selectedClient?.currency)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(calculateSubtotal() * 100, selectedClient.currency)}
                    </span>
                  </div>
                  
                  {!selectedClient.isUSClient && (
                    <>
                      <div className="flex justify-between">
                        <span>IVA (21%):</span>
                        <span className="font-medium">
                          {formatCurrency(calculateVAT() * 100, selectedClient.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Tax Withholding (15%):</span>
                        <span className="font-medium">
                          -{formatCurrency(calculateWithholding() * 100, selectedClient.currency)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal() * 100, selectedClient.currency)}</span>
                    </div>
                  </div>
                  
                  {selectedClient.currency === 'USD' && exchangeRate && (
                    <div className="text-sm text-gray-600 border-t pt-2">
                      <div className="flex justify-between">
                        <span>Total in EUR (Tax purposes):</span>
                        <span>{formatCurrency(calculateTotalEUR() * 100, 'EUR')}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Exchange rate: {exchangeRate.rate.toFixed(4)} EUR/USD
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedClient}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
    </div>
  )
}