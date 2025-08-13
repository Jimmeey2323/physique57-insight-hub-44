import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target, Package, CreditCard, PieChart, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesAnimatedMetricCardsProps {
  data: SalesData[];
}

export const SalesAnimatedMetricCards: React.FC<SalesAnimatedMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalVAT = data.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
    const netRevenue = totalRevenue - totalVAT;
    const totalTransactions = data.length;
    const uniqueMembers = new Set(data.map(item => item.memberId)).size;
    const totalUnits = data.length; // Assuming 1 unit per transaction
    const atv = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const auv = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    const asv = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
    const upt = totalTransactions > 0 ? totalUnits / totalTransactions : 0;

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        description: 'Total revenue including VAT from all transactions across all payment methods',
        calculation: 'Sum of all paymentValue fields',
        change: 12.5,
        icon: 'revenue',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50/80'
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        description: 'Revenue after VAT deduction, representing actual business income',
        calculation: 'Total Revenue - Total VAT',
        change: 8.2,
        icon: 'transactions',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50/80'
      },
      {
        title: 'Total Transactions',
        value: formatNumber(totalTransactions),
        description: 'Total number of completed sales transactions recorded in the system',
        calculation: 'Count of all transaction records',
        change: 15.3,
        icon: 'transactions',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50/80'
      },
      {
        title: 'Average Ticket Value',
        value: formatCurrency(atv),
        description: 'Average monetary value per individual transaction',
        calculation: 'Total Revenue ÷ Total Transactions',
        change: -2.1,
        icon: 'revenue',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50/80'
      },
      {
        title: 'Average Unit Value',
        value: formatCurrency(auv),
        description: 'Average revenue generated per unit sold',
        calculation: 'Total Revenue ÷ Total Units Sold',
        change: 5.7,
        icon: 'revenue',
        color: 'from-teal-500 to-teal-600',
        bgColor: 'bg-teal-50/80'
      },
      {
        title: 'Unique Members',
        value: formatNumber(uniqueMembers),
        description: 'Number of distinct customers who made purchases',
        calculation: 'Count of unique member IDs',
        change: 18.9,
        icon: 'members',
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50/80'
      },
      {
        title: 'Average Spend Value',
        value: formatCurrency(asv),
        description: 'Average total spend per unique customer across all their transactions',
        calculation: 'Total Revenue ÷ Unique Members',
        change: 7.4,
        icon: 'members',
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50/80'
      },
      {
        title: 'Units per Transaction',
        value: upt.toFixed(1),
        description: 'Average number of units sold in each transaction',
        calculation: 'Total Units ÷ Total Transactions',
        change: 3.2,
        icon: 'transactions',
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50/80'
      },
      {
        title: 'Total VAT Collected',
        value: formatCurrency(totalVAT),
        description: 'Total Value Added Tax collected from all transactions',
        calculation: 'Sum of all paymentVAT fields',
        change: 4.1,
        icon: 'revenue',
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50/80'
      }
    ];
  }, [data]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'revenue':
        return <BarChart3 className="w-6 h-6 text-blue-600" />;
      case 'members':
        return <Users className="w-6 h-6 text-green-600" />;
      case 'transactions':
        return <CreditCard className="w-6 h-6 text-purple-600" />;
      default:
        return <Target className="w-6 h-6 text-orange-600" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const isPositive = metric.change > 0;
          
          return (
            <Tooltip key={metric.title}>
              <TooltipTrigger asChild>
                <Card 
                  className={cn(
                    "relative overflow-hidden transition-all duration-700 cursor-pointer group",
                    "bg-gradient-to-br from-white via-slate-50/50 to-white",
                    "border-0 shadow-lg backdrop-blur-sm hover:shadow-2xl",
                    "hover:scale-105 hover:-translate-y-2 transform-gpu"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Top Border Animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                  
                  {/* Icon Background */}
                  <div className="absolute top-4 right-4 p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    {getIcon(metric.icon)}
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-600 mb-2 tracking-wide uppercase">{metric.title}</p>
                      <div className="flex items-end gap-3 mb-3">
                        <span className="text-3xl font-bold text-slate-900">
                          {metric.value}
                        </span>
                        <div className={cn(
                          "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300",
                          "shadow-sm border",
                          isPositive && "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200",
                          !isPositive && "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200"
                        )}>
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(metric.change).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-2000 ease-out shadow-sm"
                        style={{ width: '75%' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>

                    {/* Click Indicator */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm p-4 bg-white border shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getIcon(metric.icon)}
                    <h4 className="font-bold text-slate-800">{metric.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{metric.description}</p>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium">
                      <strong>Calculation Method:</strong>
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{metric.calculation}</p>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Click for detailed analytics →</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
