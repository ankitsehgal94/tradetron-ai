import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Since we bypassed auth, we'll use a mock user ID
const MOCK_USER_ID = 'demo-user-1';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the watchlist item to ensure it belongs to the user
    const watchlistItem = await prisma.watchlist.findUnique({
      where: {
        id,
      },
    });

    if (!watchlistItem) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    if (watchlistItem.userId !== MOCK_USER_ID) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the watchlist item
    await prisma.watchlist.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Removed from watchlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Watchlist DELETE Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to remove from watchlist',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 