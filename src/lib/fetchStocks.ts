export interface StockData {
  symbol: string;
  price: number;
  rsi: number;
  macd: number;
  volume: number;
  reason: string;
}

export async function fetchStocks(): Promise<StockData[]> {
  const apiUrl = process.env.STOCK_API_URL;
  
  if (!apiUrl) {
    throw new Error('STOCK_API_URL environment variable is not configured');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache revalidation (1 hour)
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate that the response is an array
    if (!Array.isArray(data)) {
      throw new Error('API response is not an array');
    }

    // Basic validation of data structure
    const validatedData: StockData[] = data.map((item: any) => {
      if (typeof item.symbol !== 'string' || 
          typeof item.price !== 'number' ||
          typeof item.rsi !== 'number' ||
          typeof item.macd !== 'number' ||
          typeof item.volume !== 'number' ||
          typeof item.reason !== 'string') {
        throw new Error(`Invalid stock data structure: ${JSON.stringify(item)}`);
      }
      
      return {
        symbol: item.symbol,
        price: item.price,
        rsi: item.rsi,
        macd: item.macd,
        volume: item.volume,
        reason: item.reason
      };
    });

    return validatedData;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw new Error(`Failed to fetch stocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 