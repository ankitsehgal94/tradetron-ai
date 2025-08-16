# 🚀 Stock Scanner API Documentation

**Base URL:** `http://localhost:8000`

## 📊 Main Endpoint: Flexible Stock Scanner

### `GET /api/stocks/scan`

**Description:** Single flexible API that handles all stock scanning scenarios with dynamic filtering.

---

## 🎯 **Quick Scenarios (Predefined Filters)**

### 1. Perfect Momentum Candidates
```http
GET /api/stocks/scan?scenario=perfect_momentum&limit=20
```
**Returns:** Stocks meeting ALL momentum criteria (best candidates)

### 2. High Momentum Score
```http
GET /api/stocks/scan?scenario=high_score&min_score=70&limit=15
```
**Returns:** Stocks with momentum score >= 60 (or custom min_score)

### 3. Consolidation Candidates
```http
GET /api/stocks/scan?scenario=consolidation&limit=25
```
**Returns:** Range-bound stocks ready for potential breakout

### 4. Optimal Drawdown Stocks
```http
GET /api/stocks/scan?scenario=optimal_drawdown&limit=30
```
**Returns:** Stocks 10-40% down from 52W high (buying opportunities)

### 5. Breakout Candidates
```http
GET /api/stocks/scan?scenario=breakout&min_volume=2.0&limit=20
```
**Returns:** High volume activity stocks (>1.5x volume ratio)

### 6. All Stocks (No Scenario)
```http
GET /api/stocks/scan?limit=50
```
**Returns:** All analyzed stocks with basic filtering

---

## 📋 **Complete Parameter Reference**

| Parameter | Type | Default | Options/Range | Description |
|-----------|------|---------|---------------|-------------|
| `scenario` | string | null | `perfect_momentum`, `high_score`, `consolidation`, `optimal_drawdown`, `breakout` | Predefined filtering scenario |
| `limit` | int | 50 | 1-100 | Number of results to return |
| `offset` | int | 0 | 0+ | Pagination offset |
| `min_score` | int | null | 0-100 | Minimum momentum score |
| `max_score` | int | null | 0-100 | Maximum momentum score |
| `min_drawdown` | float | null | 0-100 | Minimum drawdown percentage |
| `max_drawdown` | float | null | 0-100 | Maximum drawdown percentage |
| `market_cap` | string | null | `large`, `mid`, `small` | Market cap category filter |
| `min_volume` | float | null | 0.5+ | Minimum volume ratio filter |
| `sort_by` | string | "Momentum Score" | Any column name | Column to sort by |
| `sort_order` | string | "desc" | `asc`, `desc` | Sort direction |
| `use_cached` | bool | true | `true`, `false` | Use cached data vs live scan |

---

## 📊 **Response Format**

### Success Response (200 OK)
```json
{
  "data": [
    {
      "Symbol": "TATAGOLD",
      "Name": "Tata Gold ETF",
      "Market Cap (Cr)": 195.40,
      "Category": "Small Cap",
      "Current Price": 9.77,
      "52W High": 11.43,
      "52W Low": 6.9,
      "Drawdown %": 14.52,
      "200 MA": 8.66,
      "50 MA": 9.62,
      "20 MA": 9.72,
      "Distance from 200MA %": 12.82,
      "Distance from 50MA %": 1.61,
      "Distance from 20MA %": 0.51,
      "RSI (14)": 60.0,
      "Volume Ratio (20D)": 0.79,
      "Volume Ratio (50D)": 0.84,
      "Sector": "Financial Services",
      "Industry": "ETF",
      "Momentum Score": 100,
      "Optimal Drawdown": true,
      "Above 200MA": true,
      "Above 50MA": true,
      "Healthy RSI": true,
      "Is Consolidating": true,
      "Avg Volume (20D)": 13236441,
      "Current Volume": 10458670,
      "Data Source": "yfinance",
      "Consolidation Range %": 6.57,
      "Volatility %": 1.52,
      "Trend Deviation %": 1.96,
      "Resistance Touches": 51,
      "Support Touches": 51
    }
  ],
  "count": 1,
  "total": 14,
  "page_info": {
    "limit": 50,
    "offset": 0,
    "has_more": true,
    "next_offset": 50
  },
  "filters_applied": {
    "scenario": "perfect_momentum",
    "min_score": null,
    "max_score": null,
    "min_drawdown": null,
    "max_drawdown": null,
    "market_cap": null,
    "min_volume": null,
    "sort_by": "Momentum Score",
    "sort_order": "desc"
  },
  "cache_info": {
    "source": "cached",
    "file": "momentum_analysis_20250816_180515.csv",
    "cached_at": "2025-08-16T18:05:15.438093"
  },
  "timestamp": "2025-08-16T18:21:53.247822"
}
```

### Error Responses

#### 404 - No Cached Data
```json
{
  "detail": "No cached data available. Run a scan first or set use_cached=False"
}
```

#### 500 - Internal Server Error
```json
{
  "detail": "Scan failed: [error message]"
}
```

---

## 🎯 **Frontend Integration Examples**

### JavaScript Fetch Examples

#### 1. Get Perfect Momentum Stocks
```javascript
async function getPerfectMomentumStocks() {
  try {
    const response = await fetch(
      'http://localhost:8000/api/stocks/scan?scenario=perfect_momentum&limit=20'
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'API Error');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
}
```

#### 2. Custom Filtered Search
```javascript
async function searchStocks(filters) {
  const params = new URLSearchParams();
  
  // Add filters dynamically
  if (filters.scenario) params.append('scenario', filters.scenario);
  if (filters.minScore) params.append('min_score', filters.minScore);
  if (filters.maxScore) params.append('max_score', filters.maxScore);
  if (filters.marketCap) params.append('market_cap', filters.marketCap);
  if (filters.minVolume) params.append('min_volume', filters.minVolume);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
  
  try {
    const response = await fetch(
      `http://localhost:8000/api/stocks/scan?${params}`
    );
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'API Error');
    }
    
    return data;
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
}

// Usage example:
const results = await searchStocks({
  scenario: 'high_score',
  minScore: 70,
  marketCap: 'large',
  limit: 25,
  sortBy: 'Volume Ratio (20D)',
  sortOrder: 'desc'
});
```

#### 3. Pagination Helper
```javascript
async function getStocksPage(pageNumber, pageSize = 20, filters = {}) {
  const offset = (pageNumber - 1) * pageSize;
  
  const searchFilters = {
    ...filters,
    limit: pageSize,
    offset: offset
  };
  
  return await searchStocks(searchFilters);
}
```

---

## 🔧 **React Hook Example**

```javascript
import { useState, useEffect } from 'react';

function useStockScanner() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const scanStocks = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchStocks(filters);
      setStocks(data.data);
      setTotalCount(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stocks,
    loading,
    error,
    totalCount,
    scanStocks
  };
}
```

---

## 📊 **Data Field Explanations**

| Field | Description | Range/Format |
|-------|-------------|--------------|
| `Symbol` | Stock ticker symbol | String (e.g., "RELIANCE") |
| `Name` | Company full name | String |
| `Market Cap (Cr)` | Market cap in Crores INR | Number |
| `Category` | Market cap category | "Large Cap", "Mid Cap", "Small Cap" |
| `Current Price` | Latest stock price | Number (INR) |
| `52W High/Low` | 52-week high/low prices | Number (INR) |
| `Drawdown %` | % down from 52W high | 0-100 (lower = closer to high) |
| `200/50/20 MA` | Moving averages | Number (INR) |
| `Distance from MA %` | % above/below MA | Number (+ = above, - = below) |
| `RSI (14)` | Relative Strength Index | 0-100 (30-70 = healthy range) |
| `Volume Ratio (20D)` | Current vs 20-day avg volume | Number (>1 = higher than average) |
| `Momentum Score` | Overall momentum score | 0-100 (higher = better) |
| `Optimal Drawdown` | In 10-40% drawdown range | Boolean |
| `Above 200MA` | Price above 200-day MA | Boolean |
| `Is Consolidating` | In consolidation pattern | Boolean |
| `Healthy RSI` | RSI in 40-70 range | Boolean |

---

## 🎨 **Frontend UI Suggestions**

### Quick Action Buttons
```html
<div class="scenario-buttons">
  <button onclick="loadScenario('perfect_momentum')">🏆 Perfect Momentum</button>
  <button onclick="loadScenario('high_score')">⭐ High Score</button>
  <button onclick="loadScenario('consolidation')">📈 Consolidation</button>
  <button onclick="loadScenario('optimal_drawdown')">💎 Optimal Drawdown</button>
  <button onclick="loadScenario('breakout')">🚀 Breakout</button>
  <button onclick="loadScenario(null)">📊 All Stocks</button>
</div>
```

### Filter Panel Controls
```html
<div class="filters-panel">
  <div class="filter-group">
    <label>Momentum Score:</label>
    <input type="range" id="minScore" min="0" max="100" />
    <span id="scoreValue">0</span>
  </div>
  
  <div class="filter-group">
    <label>Market Cap:</label>
    <select id="marketCap">
      <option value="">All</option>
      <option value="large">Large Cap</option>
      <option value="mid">Mid Cap</option>
      <option value="small">Small Cap</option>
    </select>
  </div>
  
  <div class="filter-group">
    <label>Sort By:</label>
    <select id="sortBy">
      <option value="Momentum Score">Momentum Score</option>
      <option value="Drawdown %">Drawdown %</option>
      <option value="Volume Ratio (20D)">Volume Ratio</option>
      <option value="Current Price">Price</option>
    </select>
  </div>
</div>
```

---

## ⚡ **Performance Tips**

1. **Use Cached Data by Default**: Set `use_cached=true` for fast responses
2. **Implement Pagination**: Don't load all results at once
3. **Debounce Filters**: Wait for user to finish typing before API calls
4. **Show Loading States**: API calls may take 1-3 seconds
5. **Cache Results**: Store results client-side to avoid repeated calls

---

## 🔍 **Testing the API**

You can test all endpoints using:
- **Browser**: Visit `http://localhost:8000/docs` for interactive docs
- **curl**: Use the examples provided above
- **Postman**: Import the endpoints for testing

**Server Status**: Make sure your backend is running with:
```bash
cd /Users/ankit/stock_analysis
python3 -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🎯 **Ready for Frontend Integration!**

This API is designed to be frontend-friendly with:
- ✅ Single endpoint for all scenarios
- ✅ Flexible parameter-based filtering  
- ✅ Pagination support
- ✅ Consistent response format
- ✅ Error handling
- ✅ Real-time and cached data options

**Give this documentation to your frontend AI agent and they'll have everything needed to build a complete interface! 🚀**
