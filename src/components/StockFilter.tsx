"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sliders, 
  TrendingUp, 
  Target, 
  Activity, 
  BarChart3, 
  Zap,
  Filter,
  RotateCcw,
  Search
} from 'lucide-react';
import { StockData } from '@/lib/fetchStocks';
import { toast } from 'react-toastify';

interface FilterParams {
  scenario?: string;
  limit?: number;
  offset?: number;
  minScore?: number;
  maxScore?: number;
  minDrawdown?: number;
  maxDrawdown?: number;
  marketCap?: 'large' | 'mid' | 'small';
  minVolume?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface QuickScenario {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  filters: FilterParams;
}

interface StockFilterProps {
  onFilterResults: (stocks: StockData[], filterName?: string) => void;
  onFilterChange: (filters: FilterParams) => void;
  loading?: boolean;
}

const quickScenarios: QuickScenario[] = [
  {
    id: 'perfect_momentum',
    label: 'Perfect Momentum',
    icon: TrendingUp,
    description: 'Stocks meeting ALL momentum criteria (best candidates)',
    filters: {
      scenario: 'perfect_momentum',
      limit: 20
    }
  },
  {
    id: 'high_score',
    label: 'High Score Stocks',
    icon: Target,
    description: 'Top scoring opportunities',
    filters: {
      scenario: 'high_score',
      minScore: 70,
      limit: 15
    }
  },
  {
    id: 'consolidation',
    label: 'Consolidation Candidates',
    icon: Activity,
    description: 'Range-bound stocks ready for potential breakout',
    filters: {
      scenario: 'consolidation',
      limit: 25
    }
  },
  {
    id: 'optimal_drawdown',
    label: 'Optimal Drawdown',
    icon: BarChart3,
    description: 'Stocks 10-40% down from 52W high (buying opportunities)',
    filters: {
      scenario: 'optimal_drawdown',
      limit: 30
    }
  },
  {
    id: 'breakout',
    label: 'Breakout Candidates',
    icon: Zap,
    description: 'High volume activity stocks (>1.5x volume ratio)',
    filters: {
      scenario: 'breakout',
      minVolume: 2.0,
      limit: 20
    }
  }
];

export default function StockFilter({ onFilterResults, onFilterChange, loading = false }: StockFilterProps) {
  const [activeScenario, setActiveScenario] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    minScore: 0,
    maxScore: 100,
    minDrawdown: 0,
    maxDrawdown: 50,
    marketCap: undefined,
    minVolume: 1.0,
    sortBy: 'Momentum Score',
    sortOrder: 'desc',
    limit: 50
  });

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleScenarioClick = async (scenario: QuickScenario) => {
    setActiveScenario(scenario.id);
    // For scenarios, only use scenario-specific filters, not merge with current filters
    const scenarioFilters = { ...scenario.filters };
    setFilters(scenarioFilters);
    await fetchStocks(scenarioFilters);
  };

  const handleAdvancedFilter = async () => {
    setActiveScenario('');
    await fetchStocks(filters);
  };

  const handleReset = () => {
    const defaultFilters: FilterParams = {
      minScore: 0,
      maxScore: 100,
      minDrawdown: 0,
      maxDrawdown: 50,
      marketCap: undefined,
      minVolume: 1.0,
      sortBy: 'Momentum Score',
      sortOrder: 'desc',
      limit: 50
    };
    setFilters(defaultFilters);
    setActiveScenario('');
  };

  const handleViewAll = async () => {
    setActiveScenario('view-all');
    const allFilters: FilterParams = {
      limit: 50,
      sortBy: 'Momentum Score',
      sortOrder: 'desc'
    };
    setFilters(allFilters);
    await fetchStocks(allFilters);
  };

  const fetchStocks = async (filterParams: FilterParams) => {
    try {
      const params = new URLSearchParams();
      
      // If using a predefined scenario, only send scenario-specific parameters
      if (filterParams.scenario) {
        params.append('scenario', filterParams.scenario);
        
        // Only add scenario-specific parameters based on API documentation
        if (filterParams.limit) {
          params.append('limit', filterParams.limit.toString());
        }
        
        // Add scenario-specific parameters
        if (filterParams.scenario === 'high_score' && filterParams.minScore) {
          params.append('min_score', filterParams.minScore.toString());
        }
        
        if (filterParams.scenario === 'breakout' && filterParams.minVolume) {
          params.append('min_volume', filterParams.minVolume.toString());
        }
        
        // Don't add other custom filtering parameters when using scenarios
      } else {
        // Custom filtering mode - use all parameters
        if (filterParams.limit) {
          params.append('limit', filterParams.limit.toString());
        }
        
        if (filterParams.offset) {
          params.append('offset', filterParams.offset.toString());
        }
        
        if (filterParams.minScore !== undefined) {
          params.append('min_score', filterParams.minScore.toString());
        }
        
        if (filterParams.maxScore !== undefined && filterParams.maxScore < 100) {
          params.append('max_score', filterParams.maxScore.toString());
        }
        
        if (filterParams.minDrawdown !== undefined && filterParams.minDrawdown > 0) {
          params.append('min_drawdown', filterParams.minDrawdown.toString());
        }
        
        if (filterParams.maxDrawdown !== undefined && filterParams.maxDrawdown < 50) {
          params.append('max_drawdown', filterParams.maxDrawdown.toString());
        }
        
        if (filterParams.marketCap) {
          params.append('market_cap', filterParams.marketCap);
        }
        
        if (filterParams.minVolume && filterParams.minVolume > 0) {
          params.append('min_volume', filterParams.minVolume.toString());
        }
        
        if (filterParams.sortBy) {
          params.append('sort_by', filterParams.sortBy);
          params.append('sort_order', filterParams.sortOrder || 'desc');
        }
      }

      console.log('API Request:', `/api/stocks/scan?${params.toString()}`);

      const response = await fetch(`/api/stocks/scan?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      // Handle the correct response format according to documentation
      const stocksData = apiResponse.data || [];
      const totalCount = apiResponse.total || stocksData.length;
      
      // Determine filter name based on active scenario or custom filters
      let filterName = 'Custom Filter';
      if (filterParams.scenario) {
        const scenario = quickScenarios.find(s => s.filters.scenario === filterParams.scenario);
        filterName = scenario ? scenario.label : filterParams.scenario.replace('_', ' ');
      }

      onFilterResults(stocksData, filterName);
      toast.success(`Found ${stocksData.length} stocks matching criteria (${totalCount} total available)`);
      
    } catch (error) {
      console.error('Failed to fetch filtered stocks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to fetch stocks: ${errorMessage}`);
      onFilterResults([]);
    }
  };

  // Load Perfect Momentum by default when component mounts
  useEffect(() => {
    const defaultScenario = quickScenarios.find(s => s.id === 'perfect_momentum');
    if (defaultScenario) {
      handleScenarioClick(defaultScenario);
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="px-3 py-1.5">
        {/* Compact Quick Scenario Buttons */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Quick Scenarios
            </h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 h-7 px-2 text-xs"
              >
                <Sliders className="h-3 w-3" />
                Advanced
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-1 h-7 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickScenarios.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <Button
                  key={scenario.id}
                  variant={activeScenario === scenario.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleScenarioClick(scenario)}
                  disabled={loading}
                  className="flex items-center gap-2 h-8 px-3"
                  title={scenario.description}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs">{scenario.label}</span>
                </Button>
              );
            })}
            <Button
              variant={activeScenario === 'view-all' ? "default" : "outline"}
              size="sm"
              onClick={handleViewAll}
              disabled={loading}
              className="flex items-center gap-2 h-8 px-3"
              title="View all available stocks"
            >
              <Search className="h-3 w-3" />
              <span className="text-xs">View All</span>
            </Button>
          </div>
        </div>

        {/* Compact Advanced Filter Panel */}
        {showAdvanced && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-gray-50 dark:bg-gray-900">
            {/* Momentum Score Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Momentum Score: {filters.minScore || 0} - {filters.maxScore || 100}
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Min</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minScore || 0}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      minScore: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Max</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.maxScore || 100}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      maxScore: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Drawdown Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drawdown Range: {filters.minDrawdown || 0}% - {filters.maxDrawdown || 50}%
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Min</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.minDrawdown || 0}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      minDrawdown: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Max</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.maxDrawdown || 50}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      maxDrawdown: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Market Cap Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Market Cap
              </label>
              <select
                value={filters.marketCap || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  marketCap: e.target.value as 'large' | 'mid' | 'small' | undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Market Caps</option>
                <option value="large">Large Cap</option>
                <option value="mid">Mid Cap</option>
                <option value="small">Small Cap</option>
              </select>
            </div>

            {/* Volume Ratio Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Volume Ratio (minimum)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={filters.minVolume || 1.0}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minVolume: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="1.0"
              />
            </div>

            {/* Sort By Dropdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'Momentum Score'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="Momentum Score">Momentum Score</option>
                  <option value="Drawdown %">Drawdown %</option>
                  <option value="Volume Ratio (20D)">Volume Ratio</option>
                  <option value="Current Price">Current Price</option>
                  <option value="RSI (14)">RSI</option>
                  <option value="Market Cap (Cr)">Market Cap</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order
                </label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortOrder: e.target.value as 'asc' | 'desc'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="desc">Highest First</option>
                  <option value="asc">Lowest First</option>
                </select>
              </div>
            </div>

            {/* Apply Filter Button */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <Button
                onClick={handleAdvancedFilter}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-8"
                size="sm"
              >
                <Filter className="h-3 w-3" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
