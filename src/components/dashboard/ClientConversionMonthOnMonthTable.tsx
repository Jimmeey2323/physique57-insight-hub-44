
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';

interface ClientConversionMonthOnMonthTableProps {
  data: NewClientData[];
}

export const ClientConversionMonthOnMonthTable: React.FC<ClientConversionMonthOnMonthTableProps> = ({ data }) => {
  console.log('MonthOnMonth data:', data.length, 'records');

  const monthlyData = React.useMemo(() => {
    const monthlyStats = data.reduce((acc, client) => {
      const dateStr = client.firstVisitDate;
      let date: Date;
      
      // Handle different date formats consistently
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split(' ')[0].split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return acc;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          sortKey: monthKey,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          conversionSpans: [],
          visitsPostTrial: []
        };
      }
      
      acc[monthKey].newMembers++;
      
      // Count conversions correctly
      if (client.conversionStatus === 'Converted') {
        acc[monthKey].converted++;
      }
      
      // Count retention correctly  
      if (client.retentionStatus === 'Retained') {
        acc[monthKey].retained++;
      }
      
      // Sum LTV
      acc[monthKey].totalLTV += client.ltv || 0;
      
      // Collect conversion spans and visits for averages
      if (client.conversionSpan && client.conversionSpan > 0) {
        acc[monthKey].conversionSpans.push(client.conversionSpan);
      }
      if (client.visitsPostTrial && client.visitsPostTrial > 0) {
        acc[monthKey].visitsPostTrial.push(client.visitsPostTrial);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(monthlyStats)
      .map((stat: any) => ({
        ...stat,
        conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
        retentionRate: stat.newMembers > 0 ? (stat.retained / stat.newMembers) * 100 : 0,
        avgLTV: stat.newMembers > 0 ? stat.totalLTV / stat.newMembers : 0,
        avgConversionSpan: stat.conversionSpans.length > 0 
          ? stat.conversionSpans.reduce((a: number, b: number) => a + b, 0) / stat.conversionSpans.length 
          : 0,
        avgVisitsPostTrial: stat.visitsPostTrial.length > 0
          ? stat.visitsPostTrial.reduce((a: number, b: number) => a + b, 0) / stat.visitsPostTrial.length
          : 0
      }))
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    console.log('Monthly data processed:', processed);
    return processed;
  }, [data]);

  const columns = [
    {
      key: 'month',
      header: 'Month',
      className: 'font-semibold min-w-[100px]'
    },
    {
      key: 'newMembers',
      header: 'New Members',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="text-green-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'totalLTV',
      header: 'Total LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgConversionSpan',
      header: 'Avg Conv. Days',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{Math.round(value)} days</span>
    },
    {
      key: 'avgVisitsPostTrial',
      header: 'Avg Visits',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}</span>
    }
  ];

  // Calculate totals
  const totals = {
    month: 'TOTAL',
    newMembers: monthlyData.reduce((sum, row) => sum + row.newMembers, 0),
    converted: monthlyData.reduce((sum, row) => sum + row.converted, 0),
    conversionRate: 0,
    retained: monthlyData.reduce((sum, row) => sum + row.retained, 0),
    retentionRate: 0,
    totalLTV: monthlyData.reduce((sum, row) => sum + row.totalLTV, 0),
    avgLTV: monthlyData.reduce((sum, row) => sum + row.totalLTV, 0) / Math.max(monthlyData.reduce((sum, row) => sum + row.newMembers, 0), 1),
    avgConversionSpan: monthlyData.reduce((sum, row) => sum + (row.avgConversionSpan * row.newMembers), 0) / Math.max(monthlyData.reduce((sum, row) => sum + row.newMembers, 0), 1),
    avgVisitsPostTrial: monthlyData.reduce((sum, row) => sum + (row.avgVisitsPostTrial * row.newMembers), 0) / Math.max(monthlyData.reduce((sum, row) => sum + row.newMembers, 0), 1)
  };
  totals.conversionRate = totals.newMembers > 0 ? (totals.converted / totals.newMembers) * 100 : 0;
  totals.retentionRate = totals.newMembers > 0 ? (totals.retained / totals.newMembers) * 100 : 0;

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Month-on-Month Client Conversion Analysis
          <Badge variant="secondary" className="bg-white/20 text-white">
            {monthlyData.length} Months
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ModernDataTable
          data={monthlyData}
          columns={columns}
          headerGradient="from-blue-600 to-cyan-600"
          showFooter={true}
          footerData={totals}
          maxHeight="600px"
        />
      </CardContent>
    </Card>
  );
};
