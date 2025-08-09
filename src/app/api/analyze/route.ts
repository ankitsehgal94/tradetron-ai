import { NextRequest, NextResponse } from 'next/server';
import { fetchStocks } from '@/lib/fetchStocks';

export async function GET(request: NextRequest) {
  try {
    const stocks = await fetchStocks();
    
    return NextResponse.json(stocks, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For future implementation with filters
    const body = await request.json();
    console.log('Received filters:', body);
    
    // For now, just return the same data as GET
    const stocks = await fetchStocks();
    
    return NextResponse.json(stocks, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 