"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean; // New prop for embedded layout
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

// Chart preferences interface
interface ChartPreferences {
  timeframe: Timeframe;
  theme: 'Light' | 'Dark';
}

// Default chart preferences
const defaultPreferences: ChartPreferences = {
  timeframe: '1D',
  theme: 'Light'
};

export default function StockChart({ symbol, isOpen, onClose, isEmbedded = false }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartPreferences, setChartPreferences] = useState<ChartPreferences>(defaultPreferences);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  const timeframes: { value: Timeframe; label: string; interval: string }[] = [
    { value: '1D', label: '1 Day', interval: 'D' },
    { value: '1W', label: '1 Week', interval: 'W' },
    { value: '1M', label: '1 Month', interval: 'M' },
    { value: '3M', label: '3 Months', interval: '3M' },
    { value: '1Y', label: '1 Year', interval: '12M' },
  ];

  const selectedInterval = timeframes.find(tf => tf.value === timeframe)?.interval || 'D';

  // Load chart preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tradingview-chart-preferences');
    if (savedPreferences) {
      try {
        const preferences: ChartPreferences = JSON.parse(savedPreferences);
        setChartPreferences(preferences);
        setTimeframe(preferences.timeframe);
      } catch (error) {
        console.error('Error loading chart preferences:', error);
      }
    }
  }, []);

  // Save chart preferences to localStorage whenever they change
  useEffect(() => {
    const preferences: ChartPreferences = {
      ...chartPreferences,
      timeframe
    };
    localStorage.setItem('tradingview-chart-preferences', JSON.stringify(preferences));
    setChartPreferences(preferences);
  }, [timeframe]);

  // Initialize TradingView widget when symbol changes or modal opens
  useEffect(() => {
    if ((isOpen || isEmbedded) && chartContainerRef.current && symbol) {
      // Clear previous widget
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
      }

      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';

      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      widgetDiv.style.height = 'calc(100% - 32px)';
      widgetDiv.style.width = '100%';

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;

              // Widget configuration with your specific indicators
        const config = {
          autosize: true,
          symbol: symbol,
          interval: selectedInterval,
          timezone: "Etc/UTC",
          theme: chartPreferences.theme.toLowerCase(),
          style: "1",
          locale: "en",
          allow_symbol_change: true,
          calendar: false,
          support_host: "https://www.tradingview.com",
          // Add your specific indicators with exact settings
          studies: [
            {
              id: "Volume@tv-basicstudies",
              inputs: {
                "length": 9,
                "smoothingLine": "SMA",
                "smoothingLength": 9
              }
            },
            {
              id: "MAExp@tv-basicstudies",
              inputs: {
                "length": 200,
                "source": "close"
              }
            },
            {
              id: "BB@tv-basicstudies",
              inputs: {
                "length": 20,
                "mult": 2,
                "source": "close"
              }
            }
          ],
          // Save chart layout automatically
          save_image: false,
          hide_top_toolbar: false,
          hide_legend: false,
          hide_side_toolbar: false,
          details: true,
          hotlist: true,
          withdateranges: true
        };

      script.innerHTML = JSON.stringify(config);

      widgetContainer.appendChild(widgetDiv);
      widgetContainer.appendChild(script);
      
      if (chartContainerRef.current) {
        chartContainerRef.current.appendChild(widgetContainer);
      }

      widgetRef.current = widgetContainer;
    }
  }, [symbol, selectedInterval, chartPreferences.theme, isOpen, isEmbedded]);

  useEffect(() => {
    if (isOpen && !isEmbedded) {
      document.body.style.overflow = 'hidden';
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
    } else if (!isEmbedded) {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose, isEmbedded]);

  if (!isOpen && !isEmbedded) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Embedded layout (for TradingView-style interface)
  if (isEmbedded) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{symbol}</h2>
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
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Volume SMA 9, EMA 200, Bollinger Bands 20
          </div>
        </div>
        <div className="flex-1 p-4">
          <div 
            ref={chartContainerRef}
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    );
  }

  // Modal layout (original)
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
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
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Indicators: Volume SMA 9, EMA 200, Bollinger Bands 20 (Auto-loaded)
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div 
            ref={chartContainerRef}
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  );
} 