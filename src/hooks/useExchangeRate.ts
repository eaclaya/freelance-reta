'use client'

import { useState, useEffect } from 'react'
import { ExchangeRate } from '@/lib/exchange-rates'

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExchangeRate = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/exchange-rate')
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setExchangeRate({
          ...result.data,
          timestamp: new Date(result.data.timestamp)
        })
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      setExchangeRate({
        rate: 0.85,
        timestamp: new Date(),
        source: 'fallback'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExchangeRate()
    
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    exchangeRate,
    loading,
    error,
    refetch: fetchExchangeRate
  }
}