// Simple in-memory storage for demo purposes
// In production, this would be replaced with a proper database

interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  metrics: {
    name: string;
    currentPrice: number;
    rsi: number;
    drawdown: number;
    volume: number;
    momentumScore: number;
    addedAt: string;
    [key: string]: any; // For additional metrics
  };
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
let watchlistStore: WatchlistItem[] = [];

export const watchlistStorage = {
  // Get all watchlist items for a user
  findMany: async (userId: string): Promise<WatchlistItem[]> => {
    return watchlistStore.filter(item => item.userId === userId);
  },

  // Find a specific watchlist item
  findUnique: async (userId: string, symbol: string): Promise<WatchlistItem | null> => {
    return watchlistStore.find(item => 
      item.userId === userId && item.symbol === symbol
    ) || null;
  },

  // Find by ID
  findById: async (id: string): Promise<WatchlistItem | null> => {
    return watchlistStore.find(item => item.id === id) || null;
  },

  // Create a new watchlist item
  create: async (data: {
    userId: string;
    symbol: string;
    metrics: any;
  }): Promise<WatchlistItem> => {
    const newItem: WatchlistItem = {
      id: `watchlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      symbol: data.symbol,
      metrics: data.metrics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    watchlistStore.push(newItem);
    return newItem;
  },

  // Delete a watchlist item
  delete: async (id: string): Promise<boolean> => {
    const index = watchlistStore.findIndex(item => item.id === id);
    if (index !== -1) {
      watchlistStore.splice(index, 1);
      return true;
    }
    return false;
  },

  // Clear all data (for testing)
  clear: async (): Promise<void> => {
    watchlistStore = [];
  },

  // Get count for a user
  count: async (userId: string): Promise<number> => {
    return watchlistStore.filter(item => item.userId === userId).length;
  }
}; 