import { NextRequest, NextResponse } from 'next/server';

const STOCK_SCAN_API_URL = 'http://localhost:8000/api/stocks/scan';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to the external API
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    const apiUrl = params.toString() ? `${STOCK_SCAN_API_URL}?${params.toString()}` : STOCK_SCAN_API_URL;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Stock scan API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          error: 'Stock scan API error', 
          message: `API returned ${response.status}: ${response.statusText}`,
          details: 'Make sure the stock analysis API server is running on localhost:8000'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log successful response for debugging
    console.log(`Stock scan API returned ${Array.isArray(data) ? data.length : 'unknown'} results`);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('Stock scan API proxy error:', error);
    
    // Check if it's a network connection error
    const isConnectionError = error instanceof Error && 
      (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'));
    
    if (isConnectionError) {
      return NextResponse.json(
        { 
          error: 'Connection failed',
          message: 'Could not connect to the stock analysis API server',
          details: 'Please make sure the stock analysis API server is running on localhost:8000'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
