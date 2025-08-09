"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export default function StockChart({ symbol, isOpen, onClose }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');

  const timeframes: { value: Timeframe; label: string; interval: string }[] = [
    { value: '1D', label: '1 Day', interval: '1' },
    { value: '1W', label: '1 Week', interval: '1W' },
    { value: '1M', label: '1 Month', interval: '1M' },
    { value: '3M', label: '3 Months', interval: '3M' },
    { value: '1Y', label: '1 Year', interval: '12M' },
  ];

  const selectedInterval = timeframes.find(tf => tf.value === timeframe)?.interval || '1';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key press
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{symbol} Chart</h2>
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  size="sm"
                  variant={timeframe === tf.value ? "default" : "outline"}
                  onClick={() => setTimeframe(tf.value)}
                  className="px-3 py-1 text-sm"
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Chart iframe */}
        <div className="flex-1 p-4">
          <iframe
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${symbol}&interval=${selectedInterval}&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=%5B%5D&hideideas=1&theme=Light&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${symbol}`}
            width="100%"
            height="100%"
            className="border-0 rounded"
            title={`${symbol} TradingView Chart`}
          />
        </div>
      </div>
    </div>
  );
} 