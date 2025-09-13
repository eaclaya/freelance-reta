export interface ExchangeRate {
  rate: number
  timestamp: Date
  source: string
}

export async function getUSDToEURRate(): Promise<ExchangeRate> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }
    
    const data = await response.json()
    
    return {
      rate: data.rates.EUR,
      timestamp: new Date(),
      source: 'exchangerate-api.com'
    }
  } catch (error) {
    console.error('Error fetching USD to EUR rate:', error)
    
    return {
      rate: 0.85,
      timestamp: new Date(),
      source: 'fallback'
    }
  }
}

export async function getECBRate(): Promise<ExchangeRate> {
  try {
    const response = await fetch('https://api.fxratesapi.com/latest?base=USD&symbols=EUR')
    
    if (!response.ok) {
      throw new Error('Failed to fetch ECB rate')
    }
    
    const data = await response.json()
    
    return {
      rate: data.rates.EUR,
      timestamp: new Date(data.date),
      source: 'ECB via fxratesapi.com'
    }
  } catch (error) {
    console.error('Error fetching ECB rate:', error)
    throw error
  }
}

export async function getBestUSDToEURRate(): Promise<ExchangeRate> {
  try {
    const exchangeRateAPI = await getUSDToEURRate()
    return exchangeRateAPI
  } catch (error) {
    try {
      const ecbRate = await getECBRate()
      return ecbRate
    } catch (ecbError) {
      console.error('All exchange rate APIs failed, using fallback')
      return {
        rate: 0.85,
        timestamp: new Date(),
        source: 'fallback'
      }
    }
  }
}

export function convertUSDToEUR(usdAmount: number, exchangeRate: number): number {
  return Math.round(usdAmount * exchangeRate * 100) / 100
}

export function convertEURToUSD(eurAmount: number, exchangeRate: number): number {
  return Math.round(eurAmount / exchangeRate * 100) / 100
}

export function formatExchangeRate(rate: number): string {
  return `1 USD = ${rate.toFixed(4)} EUR`
}