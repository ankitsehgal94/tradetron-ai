export interface StockData {
  Symbol: string;
  Name: string;
  "Market Cap (Cr)": number;
  Category: string;
  "Current Price": number;
  "52W High": number;
  "52W Low": number;
  "Drawdown %": number;
  "200 MA": number;
  "50 MA": number;
  "20 MA": number;
  "Distance from 200MA %": number;
  "Distance from 50MA %": number;
  "Distance from 20MA %": number;
  "RSI (14)": number;
  "Volume Ratio (20D)": number;
  "Volume Ratio (50D)": number;
  Sector: string;
  Industry: string;
  "Momentum Score": number;
  "Optimal Drawdown": boolean;
  "Above 200MA": boolean;
  "Above 50MA": boolean;
  "Healthy RSI": boolean;
  "Is Consolidating": boolean;
  "Avg Volume (20D)": number;
  "Current Volume": number;
  "Data Source": string;
  "Consolidation Range %": number;
  "Volatility %": number;
  "Trend Deviation %": number;
  "Resistance Touches": number;
  "Support Touches": number;
}

export async function fetchStocks(): Promise<StockData[]> {
  // Use the real API endpoint
  const apiUrl = "http://127.0.0.1:8000/scan-cached";

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache revalidation (1 hour) - only works in server components
      ...(typeof window === 'undefined' && { next: { revalidate: 3600 } })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // The API returns an object with a "results" array
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('API response does not contain results array');
    }

    // Basic validation of data structure
    const validatedData: StockData[] = data.results.map((item: any) => {
      // Validate required fields exist
      if (typeof item.Symbol !== 'string' || 
          typeof item.Name !== 'string' ||
          typeof item["Current Price"] !== 'number' ||
          typeof item["RSI (14)"] !== 'number') {
        throw new Error(`Invalid stock data structure: ${JSON.stringify(item)}`);
      }
      
      // Return the item as-is since it matches our interface
      return item as StockData;
    });

    return validatedData;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw new Error(`Failed to fetch stocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 