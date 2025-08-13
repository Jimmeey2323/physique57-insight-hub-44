
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Percent, Users, Package, Target, AlertTriangle } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface DiscountMetricCardsProps {
  data: SalesData[];
  filters?: any;
}

export const DiscountMetricCards: React.FC<DiscountMetricCardsProps> = ({ data, filters }) => {
  const metrics = useMemo(() => {
    let filteredData = data.filter(item => (item.discountAmount || 0) > 0);

    // Apply filters
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

    const totalDiscounts = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalTransactions = filteredData.length;
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalMRP = filteredData.reduce((sum, item) => sum + (item.mrpPostTax || item.mrpPreTax || 0), 0);
    const avgDiscountPercent = totalTransactions > 0 ? filteredData.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / totalTransactions : 0;
    const uniqueCustomers = new Set(filteredData.map(item => item.customerEmail)).size;
    const uniqueProducts = new Set(filteredData.map(item => item.cleanedProduct)).size;
    const maxDiscount = Math.max(...filteredData.map(item => item.discountAmount || 0), 0);

    return {
      totalDiscounts,
      totalTransactions,
      totalRevenue,
      totalMRP,
      avgDiscountPercent,
      uniqueCustomers,
      uniqueProducts,
      maxDiscount,
      discountRate: totalMRP > 0 ? (totalDiscounts / totalMRP) * 100 : 0,
      revenueImpact: totalMRP - totalRevenue
    };
  }, [data, filters]);

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    gradient, 
    trend, 
    badge 
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    gradient: string;
    trend?: 'up' | 'down' | 'neutral';
    badge?: string;
  }) => (
    <Card className={`${gradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in-up`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <Badge className="bg-white/20 text-white border-white/30 font-semibold">
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-3xl font-bold text-white">
            {value}
          </div>
          <p className="text-sm text-white/70">
            {subtitle}
          </p>
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-3">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-300" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-300" />}
            <span className="text-xs text-white/60">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <MetricCard
        title="Total Discounts"
        value={formatCurrency(metrics.totalDiscounts)}
        subtitle={`Across ${formatNumber(metrics.totalTransactions)} transactions`}
        icon={DollarSign}
        gradient="bg-gradient-to-br from-red-500 via-red-600 to-red-700"
        trend="down"
        badge="Primary"
      />

      <MetricCard
        title="Avg Discount Rate"
        value={`${metrics.avgDiscountPercent.toFixed(1)}%`}
        subtitle={`System-wide discount percentage`}
        icon={Percent}
        gradient="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
        trend="neutral"
      />

      <MetricCard
        title="Revenue Impact"
        value={formatCurrency(metrics.revenueImpact)}
        subtitle={`Lost revenue from discounts`}
        icon={TrendingDown}
        gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
        trend="down"
      />

      <MetricCard
        title="Affected Customers"
        value={formatNumber(metrics.uniqueCustomers)}
        subtitle={`Unique customers with discounts`}
        icon={Users}
        gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
        trend="up"
      />

      <MetricCard
        title="Products Discounted"
        value={formatNumber(metrics.uniqueProducts)}
        subtitle={`Different products with discounts`}
        icon={Package}
        gradient="bg-gradient-to-br from-green-500 via-green-600 to-green-700"
        trend="neutral"
        badge={`Max: ${formatCurrency(metrics.maxDiscount)}`}
      />
    </div>
  );
};
