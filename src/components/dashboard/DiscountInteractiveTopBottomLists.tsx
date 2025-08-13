
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Users, Package, CreditCard, User, ArrowUpDown } from 'lucide-react';

interface DiscountInteractiveTopBottomListsProps {
  data: SalesData[];
  filters?: any;
}

export const DiscountInteractiveTopBottomLists: React.FC<DiscountInteractiveTopBottomListsProps> = ({ data, filters }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const processedData = useMemo(() => {
    // Apply filters
    let filteredData = data.filter(item => (item.discountAmount || 0) > 0);
    
    if (filters) {
      filteredData = filteredData.filter(item => {
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

    // Group by different dimensions
    const byCategory = filteredData.reduce((acc, item) => {
      const key = item.cleanedCategory || 'Unknown';
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    const byProduct = filteredData.reduce((acc, item) => {
      const key = item.cleanedProduct || 'Unknown';
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    const bySoldBy = filteredData.reduce((acc, item) => {
      const key = item.soldBy === '-' ? 'Online/System' : item.soldBy;
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    const byPaymentMethod = filteredData.reduce((acc, item) => {
      const key = item.paymentMethod || 'Unknown';
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    // Convert to arrays and calculate averages
    const processArray = (obj: Record<string, any>) => {
      return Object.entries(obj).map(([name, data]) => ({
        name,
        totalDiscount: data.totalDiscount,
        count: data.count,
        totalRevenue: data.totalRevenue,
        avgPercent: data.count > 0 ? data.avgPercent / data.count : 0,
        avgDiscount: data.count > 0 ? data.totalDiscount / data.count : 0
      })).sort((a, b) => sortOrder === 'desc' ? b.totalDiscount - a.totalDiscount : a.totalDiscount - b.totalDiscount);
    };

    return {
      categories: processArray(byCategory),
      products: processArray(byProduct),
      soldBy: processArray(bySoldBy),
      paymentMethods: processArray(byPaymentMethod)
    };
  }, [data, filters, sortOrder]);

  const renderList = (items: any[], icon: React.ReactNode, title: string) => (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {icon}
          {title}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="ml-auto"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 10).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <span className="font-medium text-slate-800 truncate">{item.name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {formatNumber(item.count)} transactions • {item.avgPercent.toFixed(1)}% avg discount
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">{formatCurrency(item.totalDiscount)}</div>
              <div className="text-xs text-slate-500">{formatCurrency(item.avgDiscount)}/txn</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="soldBy">Sold By</TabsTrigger>
        <TabsTrigger value="payment">Payment Method</TabsTrigger>
      </TabsList>

      <TabsContent value="categories">
        {renderList(processedData.categories, <Package className="w-5 h-5 text-blue-600" />, "Top Categories by Discount")}
      </TabsContent>

      <TabsContent value="products">
        {renderList(processedData.products, <Package className="w-5 h-5 text-green-600" />, "Top Products by Discount")}
      </TabsContent>

      <TabsContent value="soldBy">
        {renderList(processedData.soldBy, <User className="w-5 h-5 text-purple-600" />, "Top Sellers by Discount")}
      </TabsContent>

      <TabsContent value="payment">
        {renderList(processedData.paymentMethods, <CreditCard className="w-5 h-5 text-orange-600" />, "Payment Methods by Discount")}
      </TabsContent>
    </Tabs>
  );
};
