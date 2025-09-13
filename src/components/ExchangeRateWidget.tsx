'use client'

import { useExchangeRate } from '@/hooks/useExchangeRate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { formatExchangeRate } from '@/lib/exchange-rates'

export function ExchangeRateWidget() {
  const { exchangeRate, loading, error, refetch } = useExchangeRate()

  const isStale = exchangeRate && 
    (Date.now() - exchangeRate.timestamp.getTime()) > 10 * 60 * 1000

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Currency Exchange</CardTitle>
          <CardDescription>Current USD to EUR rate</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          {loading && !exchangeRate ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : exchangeRate ? (
            <>
              <div className="text-2xl font-bold">
                {exchangeRate.rate.toFixed(4)}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatExchangeRate(exchangeRate.rate)}
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Source: {exchangeRate.source}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated: {exchangeRate.timestamp.toLocaleTimeString('es-ES')}
                </p>
                {isStale && (
                  <p className="text-xs text-orange-600 flex items-center justify-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Rate may be outdated
                  </p>
                )}
                {exchangeRate.source === 'fallback' && (
                  <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Using fallback rate
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-red-500">
              Failed to load exchange rate
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}