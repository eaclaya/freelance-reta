'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Edit } from 'lucide-react'

interface UserProfile {
  name: string | null
  email: string
  taxId: string | null
  retaNumber: string | null
}

export function ProfileSummary() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setProfile(result.user)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-gray-500">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-red-500">Failed to load profile</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">My Profile</CardTitle>
          <CardDescription>Your freelancer details</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/profile">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">{profile.name || 'No name set'}</p>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>
          </div>
          
          {profile.taxId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ID:</span>
              <span className="font-medium">{profile.taxId}</span>
            </div>
          )}
          
          {profile.retaNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">RETA:</span>
              <span className="font-medium">{profile.retaNumber}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}