"use client";

import { useState } from 'react';
import { StockData } from '@/lib/fetchStocks';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Download, Eye, Plus } from 'lucide-react';
import Papa from 'papaparse';

interface StockTableProps {
  stocks: StockData[];
  onViewChart: (symbol: string) => void;
  onAddToWatchlist: (stock: StockData) => void;
}

type SortField = 'Symbol' | 'Current Price' | 'RSI (14)' | 'Drawdown %' | 'Current Volume' | 'Momentum Score';
type SortDirection = 'asc' | 'desc';

export default function StockTable({ stocks, onViewChart, onAddToWatchlist }: StockTableProps) {
  const [sortField, setSortField] = useState<SortField>('Symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
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
    
    return 0;
  });

  const exportToCSV = () => {
    const csv = Papa.unparse(stocks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `stocks-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium hover:text-blue-600 transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      )}
    </button>
  );

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No stocks match the current filters</p>
        <Button variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stock Analysis Results ({stocks.length} stocks)</h2>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortButton field="Symbol">Symbol</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="Current Price">Price</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="RSI (14)">RSI</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="Drawdown %">Drawdown</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="Current Volume">Volume</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="Momentum Score">Score</SortButton>
                </th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock, index) => (
                <tr key={stock.Symbol} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium">
                    <div>
                      <div className="font-medium">{stock.Symbol}</div>
                      <div className="text-sm text-gray-500">{stock.Name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">₹{stock["Current Price"].toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      stock["RSI (14)"] < 30 ? 'bg-green-100 text-green-800' :
                      stock["RSI (14)"] > 70 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stock["RSI (14)"].toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      stock["Drawdown %"] > 20 ? 'bg-red-100 text-red-800' :
                      stock["Drawdown %"] > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stock["Drawdown %"].toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{stock["Current Volume"].toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      stock["Momentum Score"] >= 70 ? 'bg-green-100 text-green-800' :
                      stock["Momentum Score"] >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stock["Momentum Score"]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewChart(stock.Symbol)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Chart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToWatchlist(stock)}
                        className="flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Watch
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