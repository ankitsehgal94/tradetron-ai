"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import StockTable from './StockTable';
import StockChart from './StockChart';
import { StockData } from '@/lib/fetchStocks';
import { toast } from 'react-toastify';

interface StockDashboardProps {
  user: any; // User from NextAuth session
}

export default function StockDashboard({ user }: StockDashboardProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'watchlist'>('results');

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

  const handleAddToWatchlist = async (stock: StockData) => {
    try {
      // TODO: Implement watchlist functionality
      toast.success(`${stock.Symbol} added to watchlist`);
    } catch (err) {
      toast.error('Failed to add to watchlist');
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
              <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                0
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
                  onViewChart={handleViewChart}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Watchlist Coming Soon
              </h3>
              <p className="text-gray-500">
                This feature will be implemented next
              </p>
            </div>
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