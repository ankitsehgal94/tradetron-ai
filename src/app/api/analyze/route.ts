import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Proxy the request to your Python API
    const response = await fetch('http://127.0.0.1:8000/scan-cached', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Python API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('API response does not contain results array');
    }
    
    return NextResponse.json(data.results, {
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
    const body = await request.json().catch(() => ({}));
    console.log('Received filters:', body);
    
    // Proxy the request to your Python API
    const response = await fetch('http://127.0.0.1:8000/scan-cached', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Python API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('API response does not contain results array');
    }
    
    return NextResponse.json(data.results, {
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