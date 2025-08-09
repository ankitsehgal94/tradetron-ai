import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Since we bypassed auth, we'll use a mock user ID
const MOCK_USER_ID = 'demo-user-1';

export async function GET(request: NextRequest) {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: {
        userId: MOCK_USER_ID,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(watchlist, {
      status: 200,
    });
  } catch (error) {
    console.error('Watchlist GET Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch watchlist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, currentPrice, rsi, drawdown, volume, momentumScore, metrics } = body;

    // Validate required fields
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_symbol: {
          userId: MOCK_USER_ID,
          symbol: symbol,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Stock already in watchlist' },
        { status: 409 }
      );
    }

    // Create watchlist entry
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: MOCK_USER_ID,
        symbol,
        metrics: {
          name,
          currentPrice,
          rsi,
          drawdown,
          volume,
          momentumScore,
          addedAt: new Date().toISOString(),
          ...metrics, // Include any additional metrics
        },
      },
    });

    return NextResponse.json(watchlistItem, {
      status: 201,
    });
  } catch (error) {
    console.error('Watchlist POST Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to add to watchlist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 