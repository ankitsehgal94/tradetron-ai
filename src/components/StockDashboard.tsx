"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import StockTable from './StockTable';
import StockChart from './StockChart';
import WatchlistTable from './WatchlistTable';
import { StockData } from '@/lib/fetchStocks';
import { toast } from 'react-toastify';

interface StockDashboardProps {
  user: any; // User from NextAuth session
}

interface WatchlistItem {
  id: string;
  symbol: string;
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
  const [activeTab, setActiveTab] = useState<'results' | 'watchlist'>('results');

  // Load watchlist on component mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Load watchlist when switching to watchlist tab
  useEffect(() => {
    if (activeTab === 'watchlist') {
      fetchWatchlist();
    }
  }, [activeTab]);

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
      toast.success(`Successfully loaded ${data.length} stocks`);
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

  const handleAddToWatchlist = async (stock: StockData) => {
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
          currentPrice: stock["Current Price"],
          rsi: stock["RSI (14)"],
          drawdown: stock["Drawdown %"],
          volume: stock["Current Volume"],
          momentumScore: stock["Momentum Score"],
          metrics: stock, // Store full stock data
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Trader'}!
            </h1>
            <p className="text-gray-600">
              Find swing trading opportunities with technical analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStocks}
              disabled={loading}
              className="flex items-center gap-2"
              size="lg"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              {loading ? 'Analyzing...' : 'Analyze Stocks'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analysis Results
              {stocks.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {stocks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'watchlist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Watchlist
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                activeTab === 'watchlist'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {watchlist.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'results' && (
            <div>
              {stocks.length === 0 && !loading && !error ? (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Click "Analyze Stocks" to find swing trading opportunities
                  </p>
                  <Button onClick={fetchStocks} disabled={loading}>
                    Start Analysis
                  </Button>
                </div>
              ) : (
                <StockTable
                  stocks={stocks}
                  watchlist={watchlist.map(item => item.symbol)}
                  onViewChart={handleViewChart}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <WatchlistTable
              watchlist={watchlist}
              onViewChart={handleViewChart}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              loading={watchlistLoading}
            />
          )}
        </div>
      </div>

      {/* Chart Modal */}
      <StockChart
        symbol={selectedStock || ''}
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
      />
    </div>
  );
} 