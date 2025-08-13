import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountMonthOnMonthTableProps {
  data: SalesData[];
  filters?: any;
}

export const DiscountMonthOnMonthTable: React.FC<DiscountMonthOnMonthTableProps> = ({ data, filters }) => {
  const processedData = useMemo(() => {
    const discountedData = data.filter(item => (item.discountAmount || 0) > 0);
    
    // Apply filters
    let filteredData = discountedData;
    if (filters) {
      filteredData = discountedData.filter(item => {
        if (filters.location && item.calculatedLocation !== filters.location) return false;
        if (filters.category && item.cleanedCategory !== filters.category) return false;
        if (filters.product && item.cleanedProduct !== filters.product) return false;
        if (filters.soldBy && (item.soldBy === '-' ? 'Online/System' : item.soldBy) !== filters.soldBy) return false;
        if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minDiscountAmount && (item.discountAmount || 0) < filters.minDiscountAmount) return false;
        if (filters.maxDiscountAmount && (item.discountAmount || 0) > filters.maxDiscountAmount) return false;
        if (filters.minDiscountPercent && (item.discountPercentage || 0) < filters.minDiscountPercent) return false;
        if (filters.maxDiscountPercent && (item.discountPercentage || 0) > filters.maxDiscountPercent) return false;
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const itemDate = new Date(item.paymentDate);
          if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
        }
        return true;
      });
    }

    // Group by month
    const monthlyData = filteredData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          totalPotentialRevenue: 0,
          uniqueCustomers: new Set(),
          topCategory: {},
          discountPercentages: []
        };
      }

      acc[monthKey].transactions += 1;
      acc[monthKey].totalDiscount += item.discountAmount || 0;
      acc[monthKey].totalRevenue += item.paymentValue || 0;
      acc[monthKey].totalPotentialRevenue += item.mrpPostTax || item.paymentValue || 0;
      acc[monthKey].uniqueCustomers.add(item.customerEmail);
      acc[monthKey].discountPercentages.push(item.discountPercentage || 0);

      // Track top category
      const category = item.cleanedCategory || 'Unknown';
      acc[monthKey].topCategory[category] = (acc[monthKey].topCategory[category] || 0) + (item.discountAmount || 0);

      return acc;
    }, {} as Record<string, any>);

    // Calculate MoM changes and format data
    const months = Object.keys(monthlyData).sort();
    return months.map((monthKey, index) => {
      const current = monthlyData[monthKey];
      const previous = index > 0 ? monthlyData[months[index - 1]] : null;

      // Calculate averages and changes
      const avgDiscountPercent = current.discountPercentages.length > 0 
        ? current.discountPercentages.reduce((sum: number, val: number) => sum + val, 0) / current.discountPercentages.length 
        : 0;

      const discountRate = current.totalPotentialRevenue > 0 
        ? (current.totalDiscount / current.totalPotentialRevenue) * 100 
        : 0;

      const avgDiscountAmount = current.transactions > 0 
        ? current.totalDiscount / current.transactions 
        : 0;

      const topCategory = Object.entries(current.topCategory)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];

      // Calculate MoM changes with null checks
      const discountChange = previous && previous.totalDiscount > 0
        ? ((current.totalDiscount - previous.totalDiscount) / previous.totalDiscount) * 100 
        : 0;

      const transactionChange = previous && previous.transactions > 0
        ? ((current.transactions - previous.transactions) / previous.transactions) * 100 
        : 0;

      const revenueChange = previous && previous.totalRevenue > 0
        ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
        : 0;

      return {
        month: current.month,
        monthKey,
        transactions: current.transactions,
        totalDiscount: current.totalDiscount,
        totalRevenue: current.totalRevenue,
        discountRate,
        avgDiscountPercent,
        avgDiscountAmount,
        uniqueCustomers: current.uniqueCustomers.size,
        topCategory: topCategory ? topCategory[0] : 'N/A',
        discountChange,
        transactionChange,
        revenueChange,
        revenueLost: current.totalPotentialRevenue - current.totalRevenue
      };
    }).reverse(); // Most recent first
  }, [data, filters]);

  const totals = useMemo(() => {
    return processedData.reduce((acc, row) => ({
      transactions: acc.transactions + row.transactions,
      totalDiscount: acc.totalDiscount + row.totalDiscount,
      totalRevenue: acc.totalRevenue + row.totalRevenue,
      uniqueCustomers: acc.uniqueCustomers + row.uniqueCustomers,
      revenueLost: acc.revenueLost + row.revenueLost
    }), { transactions: 0, totalDiscount: 0, totalRevenue: 0, uniqueCustomers: 0, revenueLost: 0 });
  }, [processedData]);

  const columns = [
    { 
      key: 'month', 
      header: 'Month', 
      align: 'left' as const,
      render: (value: string) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'transactions', 
      header: 'Transactions', 
      align: 'center' as const,
      render: (value: number, item: any) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">{formatNumber(value)}</span>
          {item.transactionChange !== 0 && (
            <Badge variant={item.transactionChange > 0 ? "default" : "destructive"} className="text-xs mt-1">
              {item.transactionChange > 0 ? '+' : ''}{(item.transactionChange || 0).toFixed(1)}%
            </Badge>
          )}
        </div>
      )
    },
    { 
      key: 'totalDiscount', 
      header: 'Total Discount', 
      align: 'right' as const,
      render: (value: number, item: any) => (
        <div className="flex flex-col items-end">
          <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
          {item.discountChange !== 0 && (
            <Badge variant={item.discountChange > 0 ? "destructive" : "default"} className="text-xs mt-1">
              {item.discountChange > 0 ? '+' : ''}{(item.discountChange || 0).toFixed(1)}%
            </Badge>
          )}
        </div>
      )
    },
    { 
      key: 'avgDiscountAmount', 
      header: 'Avg Discount', 
      align: 'right' as const,
      render: (value: number) => formatCurrency(value || 0)
    },
    { 
      key: 'discountRate', 
      header: 'Discount Rate', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="text-red-600 border-red-200">
          {(value || 0).toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'totalRevenue', 
      header: 'Revenue', 
      align: 'right' as const,
      render: (value: number, item: any) => (
        <div className="flex flex-col items-end">
          <span className="font-medium">{formatCurrency(value)}</span>
          {item.revenueChange !== 0 && (
            <Badge variant={item.revenueChange > 0 ? "default" : "destructive"} className="text-xs mt-1">
              {item.revenueChange > 0 ? '+' : ''}{(item.revenueChange || 0).toFixed(1)}%
            </Badge>
          )}
        </div>
      )
    },
    { 
      key: 'revenueLost', 
      header: 'Revenue Lost', 
      align: 'right' as const,
      render: (value: number) => <span className="text-red-600 font-medium">{formatCurrency(value || 0)}</span>
    },
    { 
      key: 'uniqueCustomers', 
      header: 'Customers', 
      align: 'center' as const,
      render: (value: number) => formatNumber(value || 0)
    },
    { 
      key: 'topCategory', 
      header: 'Top Category', 
      align: 'center' as const,
      render: (value: string) => <Badge variant="secondary">{value || 'N/A'}</Badge>
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-red-600" />
          Month-on-Month Discount Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          data={processedData}
          columns={columns}
          showFooter={true}
          footerData={{
            month: 'TOTAL',
            transactions: totals.transactions,
            totalDiscount: totals.totalDiscount,
            avgDiscountAmount: totals.transactions > 0 ? totals.totalDiscount / totals.transactions : 0,
            discountRate: totals.totalRevenue > 0 ? (totals.totalDiscount / (totals.totalRevenue + totals.totalDiscount)) * 100 : 0,
            totalRevenue: totals.totalRevenue,
            revenueLost: totals.revenueLost,
            uniqueCustomers: totals.uniqueCustomers,
            topCategory: 'Various',
            discountChange: 0,
            transactionChange: 0,
            revenueChange: 0
          }}
          maxHeight="500px"
          stickyHeader={true}
        />
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Total Discount Impact:</span>
              <div className="font-semibold text-red-600">{formatCurrency(totals.totalDiscount)}</div>
            </div>
            <div>
              <span className="text-slate-600">Total Transactions:</span>
              <div className="font-semibold">{formatNumber(totals.transactions)}</div>
            </div>
            <div>
              <span className="text-slate-600">Revenue Lost:</span>
              <div className="font-semibold text-red-600">{formatCurrency(totals.revenueLost)}</div>
            </div>
            <div>
              <span className="text-slate-600">Customers Affected:</span>
              <div className="font-semibold">{formatNumber(totals.uniqueCustomers)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
