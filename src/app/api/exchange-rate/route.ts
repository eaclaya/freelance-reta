import { NextResponse } from 'next/server'
import { getBestUSDToEURRate } from '@/lib/exchange-rates'

export async function GET() {
  try {
    const exchangeRate = await getBestUSDToEURRate()
    
    return NextResponse.json({
      success: true,
      data: exchangeRate
    })
  } catch (error) {
    console.error('Error in exchange rate API:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch exchange rate',
        data: {
          rate: 0.85,
          timestamp: new Date(),
          source: 'fallback'
        }
      },
      { status: 500 }
    )
  }
}