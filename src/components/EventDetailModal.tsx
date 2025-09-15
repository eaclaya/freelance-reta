'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertTriangle, FileText, Euro, DollarSign } from "lucide-react"
import { type TaxReminder } from "@/lib/spanish-tax-reminders"

interface EventDetailModalProps {
  event: TaxReminder | null
  open: boolean
  onClose: () => void
}

export function EventDetailModal({ event, open, onClose }: EventDetailModalProps) {
  if (!event) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'modelo130':
        return {
          icon: <FileText className="h-5 w-5" />,
          title: 'Quarterly Income Tax (IRPF)',
          color: 'text-red-600',
          description: 'Quarterly advance payment of personal income tax for self-employed individuals'
        }
      case 'modelo303':
        return {
          icon: <Euro className="h-5 w-5" />,
          title: 'Quarterly VAT Return',
          color: 'text-red-600',
          description: 'Quarterly VAT declaration and payment'
        }
      case 'modelo100':
        return {
          icon: <FileText className="h-5 w-5" />,
          title: 'Annual Income Tax Declaration',
          color: 'text-red-600',
          description: 'Annual personal income tax declaration'
        }
      case 'modelo390':
        return {
          icon: <Euro className="h-5 w-5" />,
          title: 'Annual VAT Summary',
          color: 'text-red-600',
          description: 'Annual VAT summary declaration'
        }
      case 'invoice':
        return {
          icon: <FileText className="h-4 w-4" />,
          title: 'Invoice Reminder',
          color: 'text-blue-600',
          description: 'Monthly invoice generation reminder'
        }
      case 'reta':
        return {
          icon: <DollarSign className="h-4 w-4" />,
          title: 'RETA Payment',
          color: 'text-green-600',
          description: 'Monthly social security payment for self-employed'
        }
      default:
        return {
          icon: <Calendar className="h-4 w-4" />,
          title: 'General Reminder',
          color: 'text-gray-600',
          description: 'General business reminder'
        }
    }
  }

  const categoryInfo = getCategoryInfo(event.category)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntil = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`
    } else if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Tomorrow'
    } else {
      return `${diffDays} days remaining`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className={categoryInfo.color}>
              {categoryInfo.icon}
            </div>
            <DialogTitle className="text-left">{event.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {categoryInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Priority:</span>
            <Badge className={getPriorityColor(event.priority)}>
              {event.priority.toUpperCase()}
            </Badge>
          </div>

          {/* Date Information */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Date:</span>
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Status:</span>
              <span className={
                event.date < new Date() ? 'text-red-600 font-medium' : 
                getDaysUntil(event.date).includes('Today') || getDaysUntil(event.date).includes('Tomorrow') ? 'text-orange-600 font-medium' :
                'text-green-600'
              }>
                {getDaysUntil(event.date)}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600">Details:</span>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                {event.description}
              </p>
            </div>
          )}

          {/* Warning for overdue or urgent items */}
          {(event.date < new Date() || getDaysUntil(event.date).includes('Today') || getDaysUntil(event.date).includes('Tomorrow')) && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Action Required</p>
                <p className="text-red-700">
                  {event.date < new Date() 
                    ? 'This deadline has passed. Please take immediate action.'
                    : 'This deadline is approaching soon. Prepare required documentation.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {event.category.includes('modelo') && (
              <Button size="sm" className="flex-1">
                Prepare Documents
              </Button>
            )}
            {event.category === 'invoice' && (
              <Button size="sm" className="flex-1">
                Create Invoice
              </Button>
            )}
            {event.category === 'reta' && (
              <Button size="sm" className="flex-1">
                Make Payment
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}