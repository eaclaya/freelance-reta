'use client'

import { useState } from 'react'
import { CalendarPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SeedRemindersButton() {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const handleSeedReminders = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/reminders/seed-spanish-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setSeeded(true)
        // Refresh the page to show new reminders
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error('Failed to seed reminders')
      }
    } catch (error) {
      console.error('Error seeding reminders:', error)
      alert('Failed to set up reminders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (seeded) {
    return (
      <Button disabled className="bg-green-600">
        <Check className="mr-2 h-4 w-4" />
        Reminders Added Successfully!
      </Button>
    )
  }

  return (
    <Button onClick={handleSeedReminders} disabled={loading}>
      <CalendarPlus className="mr-2 h-4 w-4" />
      {loading ? 'Setting up reminders...' : 'Setup Spanish Tax Reminders'}
    </Button>
  )
}