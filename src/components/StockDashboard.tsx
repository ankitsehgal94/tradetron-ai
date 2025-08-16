"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3, Plus, Filter, Tag, Trash2 } from 'lucide-react';
import StockTable from './StockTable';
import StockChart from './StockChart';
import WatchlistTable from './WatchlistTable';
import StockFilter from './StockFilter';
import { StockData } from '@/lib/fetchStocks';
import { toast } from 'react-toastify';

interface StockDashboardProps {
  user: any; // User from NextAuth session
}

interface WatchlistItem {
  id: string;
  symbol: string;
  label?: string; // TradingView-style labels like "Tech", "Energy", "Favorites", etc.
  metrics: {
    name: string;
    currentPrice: number;
    rsi: number;
    drawdown: number;
    volume: number;
    momentumScore: number;
    addedAt: string;
  };
  createdAt: string;
}

export default function StockDashboard({ user }: StockDashboardProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('All');
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [stockToLabel, setStockToLabel] = useState<string | null>(null);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  // Available labels (like TradingView categories)
  const availableLabels = ['All', 'Favorites', 'Tech', 'Energy', 'Finance', 'Healthcare', 'Consumer', 'Industrial'];
  const filteredWatchlist = selectedLabel === 'All' 
    ? watchlist 
    : watchlist.filter(item => item.label === selectedLabel);

  // Load watchlist and select first stock on component mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Auto-select first stock when watchlist loads
  useEffect(() => {
    if (watchlist.length > 0 && !selectedStock) {
      setSelectedStock(watchlist[0].symbol);
    }
  }, [watchlist, selectedStock]);

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Next.js API route as proxy to avoid CORS issues
      const response = await fetch('/api/analyze');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch stock data');
      }
      
      // The API proxy returns the results array directly
      setStocks(data);
      
      // Replace watchlist with fetched stocks (legacy analysis)
      if (data.length > 0) {
        await replaceWatchlistWithFilteredStocks(data);
      }
      
      toast.success(`Successfully loaded ${data.length} stocks and replaced watchlist`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to fetch stocks: ${errorMessage}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChart = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const fetchWatchlist = async () => {
    setWatchlistLoading(true);
    try {
      const response = await fetch('/api/watchlist');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
      toast.error('Failed to load watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  // Replace watchlist with filtered stocks (like TradingView)
  const replaceWatchlistWithFilteredStocks = async (stocksToAdd: StockData[]) => {
    try {
      // First, clear the existing watchlist
      await clearWatchlist();
      
      // Then add all the new filtered stocks
      const newWatchlistItems = [];
      for (const stock of stocksToAdd) {
        try {
          const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              symbol: stock.Symbol,
              name: stock.Name,
              label: 'All', // Default label
              currentPrice: stock["Current Price"],
              rsi: stock["RSI (14)"],
              drawdown: stock["Drawdown %"],
              volume: stock["Current Volume"],
              momentumScore: stock["Momentum Score"],
              metrics: stock, // Store full stock data
            }),
          });

          if (response.ok) {
            const newWatchlistItem = await response.json();
            newWatchlistItems.push(newWatchlistItem);
          }
        } catch (err) {
          console.error(`Failed to add ${stock.Symbol}:`, err);
        }
      }
      
      // Update the watchlist state with all new items
      setWatchlist(newWatchlistItems);
      
      if (newWatchlistItems.length > 0) {
        toast.success(`Watchlist updated with ${newWatchlistItems.length} stocks`);
      }
      
    } catch (error) {
      console.error('Failed to replace watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  // Clear all items from watchlist
  const clearWatchlist = async () => {
    try {
      // Remove all existing watchlist items
      const deletePromises = watchlist.map(async (item) => {
        try {
          await fetch(`/api/watchlist/${item.id}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error(`Failed to delete ${item.symbol}:`, err);
        }
      });
      
      await Promise.all(deletePromises);
      setWatchlist([]);
      toast.success('Watchlist cleared');
      
    } catch (error) {
      console.error('Failed to clear watchlist:', error);
      toast.error('Failed to clear watchlist');
    }
  };

  const handleAddToWatchlist = async (stock: StockData) => {
    // For manual additions, we still add individual stocks
    try {
      // Check if already in watchlist
      const isInWatchlist = watchlist.some(item => item.symbol === stock.Symbol);
      if (isInWatchlist) {
        toast.info(`${stock.Symbol} is already in your watchlist`);
        return;
      }

      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stock.Symbol,
          name: stock.Name,
          label: 'All',
          currentPrice: stock["Current Price"],
          rsi: stock["RSI (14)"],
          drawdown: stock["Drawdown %"],
          volume: stock["Current Volume"],
          momentumScore: stock["Momentum Score"],
          metrics: stock,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to watchlist');
      }

      const newWatchlistItem = await response.json();
      setWatchlist(prev => [newWatchlistItem, ...prev]);
      toast.success(`${stock.Symbol} added to watchlist`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to watchlist';
      toast.error(errorMessage);
    }
  };

  const handleUpdateStockLabel = async (symbol: string, label: string) => {
    try {
      const stockItem = watchlist.find(item => item.symbol === symbol);
      if (!stockItem) return;

      const response = await fetch(`/api/watchlist/${stockItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label }),
      });

      if (response.ok) {
        setWatchlist(prev => prev.map(item => 
          item.symbol === symbol ? { ...item, label } : item
        ));
        toast.success(`${symbol} labeled as ${label}`);
      }
    } catch (err) {
      toast.error('Failed to update label');
    }
  };

  const handleRemoveFromWatchlist = async (watchlistItem: WatchlistItem) => {
    try {
      const response = await fetch(`/api/watchlist/${watchlistItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }

      setWatchlist(prev => prev.filter(item => item.id !== watchlistItem.id));
      toast.success(`${watchlistItem.symbol} removed from watchlist`);
    } catch (err) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleFilterResults = (filteredStocks: StockData[]) => {
    setFilteredStocks(filteredStocks);
    // Replace watchlist with current filter results
    if (filteredStocks.length > 0) {
      replaceWatchlistWithFilteredStocks(filteredStocks);
    } else {
      // If no results, clear the watchlist
      clearWatchlist();
    }
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  // Determine which stocks to display - filtered stocks or original stocks
  const displayStocks = filteredStocks.length > 0 ? filteredStocks : stocks;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Side - Chart Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedStock || 'Trading Dashboard'}
              </h1>
              {selectedStock && (
                <div className="flex items-center gap-2">
                  {availableLabels.filter(label => label !== 'All').map(label => (
                    <Button
                      key={label}
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStockLabel(selectedStock, label)}
                      className="h-6 px-2 text-xs"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchStocks}
                disabled={loading}
                className="flex items-center gap-2"
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                {loading ? 'Analyzing...' : 'Legacy Analysis'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Stock Filter */}
        <StockFilter
          onFilterResults={handleFilterResults}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Chart Container */}
        <div className="flex-1 p-4">
          {selectedStock ? (
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <StockChart
                symbol={selectedStock}
                isOpen={true}
                onClose={() => {}} // Don't close in this layout
                isEmbedded={true}
              />
            </div>
          ) : (
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Stock to View Chart
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a stock from the watchlist to display its technical analysis chart
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Stock Watchlist */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Watchlist Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Watchlist
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredWatchlist.length} stocks
                {displayStocks.length > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {displayStocks.length} filtered
                  </span>
                )}
              </span>
              {watchlist.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearWatchlist}
                  className="p-1 h-auto"
                  title="Clear watchlist"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Label Filter */}
          <div className="flex gap-1 mb-4 overflow-x-auto">
            {availableLabels.map(label => (
              <Button
                key={label}
                size="sm"
                variant={selectedLabel === label ? "default" : "outline"}
                onClick={() => setSelectedLabel(label)}
                className="whitespace-nowrap"
              >
                {label}
                {label !== 'All' && (
                  <span className="ml-1 text-xs">
                    ({watchlist.filter(item => item.label === label).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Stock List */}
        <div className="flex-1 overflow-auto">
          {watchlistLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Stocks in {selectedLabel}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Use the filter above to scan for stocks or run legacy analysis
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredWatchlist.map(item => (
                <div
                  key={item.id}
                  className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedStock === item.symbol
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedStock(item.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {item.symbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.metrics.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${item.metrics.currentPrice?.toFixed(2) || 'N/A'}
                      </div>
                      {item.label && (
                        <div className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 rounded">
                          {item.label}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>RSI: {item.metrics.rsi?.toFixed(1) || 'N/A'}</span>
                    <span>Score: {item.metrics.momentumScore?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 