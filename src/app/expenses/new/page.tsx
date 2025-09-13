'use client'

import { useState } from 'react'
import { ArrowLeft, Receipt, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const expenseCategories = [
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'MEALS', label: 'Meals' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'RENT', label: 'Rent' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OTHER', label: 'Other' }
]

export default function NewExpensePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    currency: 'EUR',
    vatRate: '',
    isDeductible: true,
    notes: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert amount to cents
      const amountCents = Math.round(parseFloat(formData.amount) * 100)
      const vatRate = formData.vatRate ? parseFloat(formData.vatRate) : null

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amountCents,
          vatRate
        }),
      })

      if (response.ok) {
        // Redirect to expenses page
        window.location.href = '/expenses'
      } else {
        throw new Error('Failed to create expense')
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Failed to create expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">RETA Freelance Accounting</h1>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <a href="/">Dashboard</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/clients">Clients</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/invoices">Invoices</a>
              </Button>
              <Button variant="default" asChild>
                <a href="/expenses">Expenses</a>
              </Button>
              <Button variant="ghost">Reports</Button>
              <Button variant="ghost">Calendar</Button>
              <Button variant="ghost" asChild>
                <a href="/profile">Profile</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-4">
              <a href="/expenses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Expenses
              </a>
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Expense</h2>
              <p className="text-gray-600">Track your business expenses for tax deductions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>Enter the information about your business expense</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Select a category...</option>
                        {expenseCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Describe the expense..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vatRate">VAT Rate (%)</Label>
                      <Input
                        id="vatRate"
                        name="vatRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="21.00"
                        value={formData.vatRate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDeductible"
                        name="isDeductible"
                        checked={formData.isDeductible}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="isDeductible">Tax deductible expense</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Check this if the expense can be deducted from your taxes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Additional notes about this expense..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" asChild>
                      <a href="/expenses">Cancel</a>
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Receipt className="mr-2 h-4 w-4" />
                      {loading ? 'Creating...' : 'Create Expense'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Receipt Upload
                </CardTitle>
                <CardDescription>
                  Upload receipt for this expense (coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Receipt upload feature will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spanish Tax Deduction Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <h4 className="font-medium">Common Deductible Expenses:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Office supplies and equipment</li>
                  <li>Professional software licenses</li>
                  <li>Business travel expenses</li>
                  <li>Professional services</li>
                  <li>Internet and phone bills</li>
                  <li>Professional education</li>
                  <li>Business insurance</li>
                  <li>Office rent (proportional)</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Always consult with a tax advisor for specific deduction rules
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}