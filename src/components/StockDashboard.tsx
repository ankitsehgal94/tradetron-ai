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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('All');
  const [currentResults, setCurrentResults] = useState<StockData[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [currentFilterName, setCurrentFilterName] = useState<string>('Perfect Momentum');

  // Available labels (like TradingView categories) 
  const availableLabels = ['All', 'Favorites', 'Tech', 'Energy', 'Finance', 'Healthcare', 'Consumer', 'Industrial'];

  // Auto-select first stock when results load
  useEffect(() => {
    if (currentResults.length > 0 && !selectedStock) {
      setSelectedStock(currentResults[0].Symbol);
    }
  }, [currentResults, selectedStock]);

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
      
      // Set the current results  
      setCurrentResults(data);
      setCurrentFilterName('Legacy Analysis');
      
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

  // Clear the current results
  const clearResults = () => {
    setCurrentResults([]);
    setSelectedStock(null);
    setCurrentFilterName('No Filter');
    toast.success('Results cleared');
  };

  const handleAddToWatchlist = async (stock: StockData) => {
    // This could be used for adding to a real watchlist feature later
    toast.info(`${stock.Symbol} - Add to watchlist feature coming soon!`);
  };

  const handleUpdateStockLabel = async (symbol: string, label: string) => {
    // Labels could be implemented later for categorizing stocks
    toast.success(`${symbol} labeled as ${label} (feature coming soon!)`);
  };

  const handleFilterResults = (filteredStocks: StockData[], filterName?: string) => {
    setCurrentResults(filteredStocks);
    if (filterName) {
      setCurrentFilterName(filterName);
    }
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  // Current stocks to display are just the current results
  const displayStocks = currentResults;

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

      {/* Right Side - Filter Results */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Results Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filter Results
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentFilterName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {displayStocks.length} stocks
              </span>
              {displayStocks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResults}
                  className="p-1 h-auto"
                  title="Clear results"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stock Results List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : displayStocks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Filter Results
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Use the filters above to scan for stocks matching your criteria
              </p>
            </div>
          ) : (
            <div className="p-2">
              {displayStocks.map((stock, index) => (
                <div
                  key={`${stock.Symbol}-${index}`}
                  className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedStock === stock.Symbol
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedStock(stock.Symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {stock.Symbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {stock.Name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ₹{stock["Current Price"]?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {stock.Category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>RSI: {stock["RSI (14)"]?.toFixed(1) || 'N/A'}</span>
                    <span>Score: {stock["Momentum Score"]?.toFixed(0) || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Drawdown: {stock["Drawdown %"]?.toFixed(1) || 'N/A'}%</span>
                    <span>Vol: {(stock["Volume Ratio (20D)"] || 0).toFixed(1)}x</span>
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