"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Eye, Trash2 } from 'lucide-react';

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

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  onViewChart: (symbol: string) => void;
  onRemoveFromWatchlist: (item: WatchlistItem) => void;
  loading?: boolean;
}

type SortField = 'symbol' | 'currentPrice' | 'rsi' | 'drawdown' | 'momentumScore' | 'addedAt';
type SortDirection = 'asc' | 'desc';

export default function WatchlistTable({ 
  watchlist, 
  onViewChart, 
  onRemoveFromWatchlist, 
  loading = false 
}: WatchlistTableProps) {
  const [sortField, setSortField] = useState<SortField>('addedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'symbol') {
      aValue = a.symbol;
      bValue = b.symbol;
    } else if (sortField === 'addedAt') {
      aValue = new Date(a.metrics.addedAt);
      bValue = new Date(b.metrics.addedAt);
    } else {
      aValue = a.metrics[sortField as keyof typeof a.metrics];
      bValue = b.metrics[sortField as keyof typeof b.metrics];
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    return 0;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading watchlist...</p>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Your watchlist is empty</p>
        <p className="text-sm text-gray-400 mt-2">
          Add stocks to your watchlist from the Analysis Results tab
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Watchlist ({watchlist.length} stocks)</h2>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">
                  <SortButton field="symbol">Symbol</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">
                  <SortButton field="currentPrice">Price</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">
                  <SortButton field="rsi">RSI</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">
                  <SortButton field="drawdown">Drawdown</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">
                  <SortButton field="momentumScore">Score</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">
                  <SortButton field="addedAt">Added</SortButton>
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedWatchlist.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="px-4 py-3 font-medium">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.metrics.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">₹{item.metrics.currentPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.metrics.rsi < 30 ? 'bg-green-100 text-green-800' :
                      item.metrics.rsi > 70 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.metrics.rsi.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.metrics.drawdown > 20 ? 'bg-red-100 text-red-800' :
                      item.metrics.drawdown > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.metrics.drawdown.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.metrics.momentumScore >= 70 ? 'bg-green-100 text-green-800' :
                      item.metrics.momentumScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.metrics.momentumScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {new Date(item.metrics.addedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewChart(item.symbol)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Chart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveFromWatchlist(item)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 