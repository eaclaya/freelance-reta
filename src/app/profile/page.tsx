'use client'

import { useState, useEffect } from 'react'
import { User, Save, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UserProfile {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  taxId: string | null
  retaNumber: string | null
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    email: '',
    name: '',
    phone: '',
    address: '',
    taxId: '',
    retaNumber: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setFormData({
              id: result.user.id,
              email: result.user.email || '',
              name: result.user.name || '',
              phone: result.user.phone || '',
              address: result.user.address || '',
              taxId: result.user.taxId || '',
              retaNumber: result.user.retaNumber || ''
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || null,
          phone: formData.phone || null,
          address: formData.address || null,
          taxId: formData.taxId || null,
          retaNumber: formData.retaNumber || null
        }),
      })

      if (response.ok) {
        alert('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </a>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
            <p className="text-gray-600">Manage your freelancer details and RETA information</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic contact information and identification details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full legal name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+34 123 456 789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID (NIF/NIE) *</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      required
                      placeholder="12345678Z"
                    />
                    <p className="text-xs text-gray-500">
                      Your Spanish tax identification number
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, Province, Postal Code"
                  />
                  <p className="text-xs text-gray-500">
                    Your registered business address in Spain
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retaNumber">RETA Registration Number</Label>
                  <Input
                    id="retaNumber"
                    name="retaNumber"
                    value={formData.retaNumber}
                    onChange={handleChange}
                    placeholder="RETA-001"
                  />
                  <p className="text-xs text-gray-500">
                    Your Social Security autonomo registration number
                  </p>
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RETA Status Information</CardTitle>
              <CardDescription>
                Important information about your Spanish autonomo status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200 bg-green-50">
                  <div>
                    <p className="font-medium text-green-900">Registration Status</p>
                    <p className="text-sm text-green-700">Active Autonomo</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Current Quarter</p>
                    <p className="text-gray-600">Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Next RETA Payment</p>
                    <p className="text-gray-600">End of this month</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Tax Regime</p>
                    <p className="text-gray-600">General Regime</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">VAT Status</p>
                    <p className="text-gray-600">Standard 21% IVA</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}