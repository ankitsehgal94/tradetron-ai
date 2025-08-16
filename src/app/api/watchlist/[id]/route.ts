import { NextRequest, NextResponse } from 'next/server';
import { watchlistStorage } from '@/lib/watchlistStorage';

// Since we bypassed auth, we'll use a mock user ID
const MOCK_USER_ID = 'demo-user-1';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { label } = body;

    // Find the watchlist item
    const watchlistItem = await watchlistStorage.findById(id);
    
    if (!watchlistItem) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    // Update the watchlist item
    const updatedItem = await watchlistStorage.update(id, { label });

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Failed to update watchlist item' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Watchlist PATCH Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update watchlist item',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the watchlist item to ensure it belongs to the user
    const watchlistItem = await watchlistStorage.findById(id);

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
    const deleted = await watchlistStorage.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete watchlist item' },
        { status: 500 }
      );
    }

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