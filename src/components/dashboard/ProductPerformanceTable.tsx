
import React, { useMemo, useState, useCallback } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Package, TrendingUp, TrendingDown, Star, ChevronDown, ChevronRight, Edit3, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ProductPerformanceTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  selectedMetric?: YearOnYearMetricType;
}

export const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({
  data,
  filters = {
    dateRange: { start: '', end: '' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  },
  onRowClick,
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('• Top performing products driving 60% of total revenue\n• Product diversification strategy showing positive results\n• Focus on high-margin items recommended');
  const [localCollapsedGroups, setLocalCollapsedGroups] = useState<Set<string>>(new Set());

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
    if (!items.length) return 0;
    switch (metric) {
      case 'revenue':
        return items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      case 'transactions':
        return items.length;
      case 'members':
        return new Set(items.map(item => item.memberId)).size;
      case 'units':
        return items.length;
      case 'atv':
        const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        return items.length > 0 ? totalRevenue / items.length : 0;
      case 'auv':
        const revenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const units = items.length;
        return units > 0 ? revenue / units : 0;
      case 'asv':
        const totalRev = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const uniqueMembers = new Set(items.map(item => item.memberId)).size;
        return uniqueMembers > 0 ? totalRev / uniqueMembers : 0;
      case 'upt':
        return items.length > 0 ? items.length / items.length : 0;
      case 'vat':
        return items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
      default:
        return 0;
    }
  };

  const formatMetricValue = (value: number, metric: YearOnYearMetricType) => {
    switch (metric) {
      case 'revenue':
      case 'auv':
      case 'atv':
      case 'asv':
      case 'vat':
        return formatCurrency(value);
      case 'transactions':
      case 'members':
      case 'units':
        return formatNumber(value);
      case 'upt':
        return value.toFixed(2);
      default:
        return formatNumber(value);
    }
  };

  const handleQuickFilter = useCallback((filterType: string, value: string) => {
    // This would be implemented to filter data based on the selected criteria
    console.log('Quick filter applied:', filterType, value);
  }, []);

  // Generate monthly data from Jun 2025 to Jan 2024 (current date backwards)
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Start from Jun 2025 and go backwards to Jan 2024
    // 2025 months (Jun to Jan) - descending
    for (let i = 5; i >= 0; i--) {
      const monthName = monthNames[i];
      const monthNum = i + 1;
      months.push({
        key: `2025-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2025`,
        year: 2025,
        month: monthNum,
        quarter: Math.ceil(monthNum / 3)
      });
    }
    
    // 2024 months (Dec to Jan) - descending
    for (let i = 11; i >= 0; i--) {
      const monthName = monthNames[i];
      const monthNum = i + 1;
      months.push({
        key: `2024-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2024`,
        year: 2024,
        month: monthNum,
        quarter: Math.ceil(monthNum / 3)
      });
    }
    
    return months;
  }, []);

  const processedData = useMemo(() => {
    // Group by category first, then by product
    const categoryGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const category = item.cleanedCategory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    const categoryData = Object.entries(categoryGroups).map(([category, categoryItems]) => {
      // Group products within each category
      const productGroups = categoryItems.reduce((acc: Record<string, SalesData[]>, item) => {
        const product = item.cleanedProduct || 'Unspecified';
        if (!acc[product]) {
          acc[product] = [];
        }
        acc[product].push(item);
        return acc;
      }, {});

      const products = Object.entries(productGroups).map(([product, items]) => {
        const monthlyValues: Record<string, number> = {};

        monthlyData.forEach(({ key, year, month }) => {
          const monthItems = items.filter(item => {
            const itemDate = parseDate(item.paymentDate);
            return itemDate && itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
          });
          monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
        });

        const metricValue = getMetricValue(items, selectedMetric);
        
        return {
          product,
          category,
          metricValue,
          monthlyValues,
          rawData: items
        };
      });

      // Calculate category totals
      const categoryMonthlyValues: Record<string, number> = {};
      monthlyData.forEach(({ key }) => {
        categoryMonthlyValues[key] = products.reduce((sum, product) => sum + (product.monthlyValues[key] || 0), 0);
      });

      return {
        category,
        products: products.sort((a, b) => b.metricValue - a.metricValue),
        metricValue: getMetricValue(categoryItems, selectedMetric),
        monthlyValues: categoryMonthlyValues,
        rawData: categoryItems
      };
    });

    return categoryData.sort((a, b) => b.metricValue - a.metricValue);
  }, [data, selectedMetric, monthlyData]);

  const getPerformanceIndicator = (value: number, index: number) => {
    if (index === 0) return <Star className="w-4 h-4 text-yellow-500" />;
    if (index < 3) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return null;
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />;
    const growth = ((current - previous) / previous) * 100;
    if (growth > 5) {
      return <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />;
    } else if (growth < -5) {
      return <TrendingDown className="w-3 h-3 text-red-500 inline ml-1" />;
    }
    return null;
  };

  // Calculate totals row
  const totalsRow = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    monthlyData.forEach(({ key }) => {
      monthlyTotals[key] = processedData.reduce((sum, category) => sum + (category.monthlyValues[key] || 0), 0);
    });
    
    return {
      category: 'TOTAL',
      metricValue: getMetricValue(data, selectedMetric),
      monthlyValues: monthlyTotals
    };
  }, [processedData, monthlyData, data, selectedMetric]);

  const saveSummary = () => {
    setIsEditingSummary(false);
    localStorage.setItem('productPerformanceSummary', summaryText);
  };

  const cancelEdit = () => {
    setIsEditingSummary(false);
    const saved = localStorage.getItem('productPerformanceSummary');
    if (saved) setSummaryText(saved);
  };

  // Group months by quarters and years
  const groupedMonths = useMemo(() => {
    const quarters: Record<string, typeof monthlyData> = {};
    monthlyData.forEach(month => {
      const quarterKey = `${month.year}-Q${month.quarter}`;
      if (!quarters[quarterKey]) quarters[quarterKey] = [];
      quarters[quarterKey].push(month);
    });
    return quarters;
  }, [monthlyData]);

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(localCollapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setLocalCollapsedGroups(newCollapsed);
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Product Performance Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monthly product performance metrics with quarterly grouping (Jun 2025 - Jan 2024)
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold text-sm uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-4 py-3 text-left rounded-tl-lg sticky left-0 bg-blue-800 z-30">Category / Product</th>
                {Object.entries(groupedMonths).map(([quarterKey, months]) => (
                  <th key={quarterKey} colSpan={months.length} className="text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 text-center border-l border-blue-600">
                    {quarterKey}
                  </th>
                ))}
              </tr>
              <tr>
                {monthlyData.map(({ key, display }) => (
                  <th key={key} className="text-white font-semibold text-xs uppercase tracking-wider px-3 py-2 bg-blue-800 border-l border-blue-600">
                    <div className="flex flex-col">
                      <span className="text-sm">{display.split(' ')[0]}</span>
                      <span className="text-blue-200 text-xs">{display.split(' ')[1]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((categoryData, categoryIndex) => (
                <React.Fragment key={categoryData.category}>
                  {/* Category Header Row */}
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300 font-bold">
                    <td className="px-4 py-3 text-sm font-bold text-gray-800 sticky left-0 bg-gradient-to-r from-gray-100 to-gray-200 border-r border-gray-300">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGroup(categoryData.category)}
                          className="p-1 h-6 w-6 text-gray-600 hover:text-gray-800"
                        >
                          {localCollapsedGroups.has(categoryData.category) ? 
                            <ChevronRight className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </Button>
                        <span className="font-bold">#{categoryIndex + 1} {categoryData.category}</span>
                        <Badge variant="outline" className="text-xs bg-gray-200">
                          {categoryData.products.length} products
                        </Badge>
                        {getPerformanceIndicator(categoryData.metricValue, categoryIndex)}
                      </div>
                    </td>
                    {monthlyData.map(({ key }, monthIndex) => {
                      const current = categoryData.monthlyValues[key] || 0;
                      const previous = monthIndex > 0 ? categoryData.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                      return (
                        <td key={key} className="px-3 py-3 text-center text-sm text-gray-800 font-mono font-bold border-l border-gray-300">
                          <div className="flex items-center justify-center">
                            {formatMetricValue(current, selectedMetric)}
                            {getGrowthIndicator(current, previous)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Product Rows */}
                  {!localCollapsedGroups.has(categoryData.category) && categoryData.products.map((product, productIndex) => (
                    <tr 
                      key={`${categoryData.category}-${product.product}`}
                      className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-200" 
                      onClick={() => onRowClick(product.rawData)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 max-w-48">
                        <div className="flex items-center gap-2 pl-8">
                          <span className="text-gray-500">#{productIndex + 1}</span>
                          <span className="truncate">{product.product}</span>
                        </div>
                      </td>
                      {monthlyData.map(({ key }, monthIndex) => {
                        const current = product.monthlyValues[key] || 0;
                        const previous = monthIndex > 0 ? product.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                        return (
                          <td key={key} className="px-3 py-3 text-center text-sm text-gray-900 font-mono border-l border-gray-100">
                            <div className="flex items-center justify-center">
                              {formatMetricValue(current, selectedMetric)}
                              {getGrowthIndicator(current, previous)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 font-bold">
                <td className="px-4 py-3 text-sm font-bold text-blue-900 sticky left-0 bg-blue-100 border-r border-blue-200">
                  TOTAL
                </td>
                {monthlyData.map(({ key }) => (
                  <td key={key} className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold border-l border-blue-200">
                    {formatMetricValue(totalsRow.monthlyValues[key] || 0, selectedMetric)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary/Insights Section */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-white rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Product Performance Insights
            </h4>
            {!isEditingSummary ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveSummary} className="gap-2 text-green-600">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-2 text-red-600">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          {isEditingSummary ? (
            <Textarea
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Enter product performance insights using bullet points (• )"
              className="min-h-32 text-sm"
            />
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {summaryText}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
