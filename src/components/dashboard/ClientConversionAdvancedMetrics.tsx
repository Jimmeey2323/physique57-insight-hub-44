
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';

interface ClientConversionAdvancedMetricsProps {
  data: NewClientData[];
}

export const ClientConversionAdvancedMetrics: React.FC<ClientConversionAdvancedMetricsProps> = ({ data }) => {
  console.log('ClientConversionAdvancedMetrics data:', data.length, 'records');

  // Membership performance analysis
  const membershipStats = React.useMemo(() => {
    const stats = data.reduce((acc, client) => {
      const membership = client.membershipUsed || 'No Membership';
      if (!acc[membership]) {
        acc[membership] = {
          membershipType: membership,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          conversionSpans: []
        };
      }
      
      acc[membership].totalClients++;
      if (client.conversionStatus === 'Converted') acc[membership].converted++;
      if (client.retentionStatus === 'Retained') acc[membership].retained++;
      acc[membership].totalLTV += client.ltv || 0;
      if (client.conversionSpan && client.conversionSpan > 0) {
        acc[membership].conversionSpans.push(client.conversionSpan);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(stats).map((stat: any) => ({
      ...stat,
      conversionRate: stat.totalClients > 0 ? (stat.converted / stat.totalClients) * 100 : 0,
      retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      avgConversionSpan: stat.conversionSpans.length > 0 
        ? stat.conversionSpans.reduce((a: number, b: number) => a + b, 0) / stat.conversionSpans.length 
        : 0
    })).filter(stat => stat.totalClients > 0);

    console.log('Membership stats processed:', processed);
    return processed;
  }, [data]);

  // Trainer performance analysis
  const trainerStats = React.useMemo(() => {
    const stats = data.reduce((acc, client) => {
      const trainer = client.trainerName || 'No Trainer';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainerName: trainer,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          classNumbers: []
        };
      }
      
      acc[trainer].totalClients++;
      if (client.conversionStatus === 'Converted') acc[trainer].converted++;
      if (client.retentionStatus === 'Retained') acc[trainer].retained++;
      acc[trainer].totalLTV += client.ltv || 0;
      if (client.classNo && client.classNo > 0) {
        acc[trainer].classNumbers.push(client.classNo);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(stats).map((stat: any) => ({
      ...stat,
      conversionRate: stat.totalClients > 0 ? (stat.converted / stat.totalClients) * 100 : 0,
      retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      avgClassNo: stat.classNumbers.length > 0 
        ? stat.classNumbers.reduce((a: number, b: number) => a + b, 0) / stat.classNumbers.length 
        : 0
    })).filter(stat => stat.totalClients > 0);

    console.log('Trainer stats processed:', processed);
    return processed;
  }, [data]);

  const membershipColumns = [
    {
      key: 'membershipType',
      header: 'Membership Type',
      className: 'font-semibold min-w-[200px]'
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
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
    }
  ];

  const trainerColumns = [
    {
      key: 'trainerName',
      header: 'Trainer Name',
      className: 'font-semibold min-w-[150px]'
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
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
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgClassNo',
      header: 'Avg Classes',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}</span>
    }
  ];

  // Calculate totals for membership table
  const membershipTotals = {
    membershipType: 'TOTAL',
    totalClients: membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    converted: membershipStats.reduce((sum, stat) => sum + stat.converted, 0),
    conversionRate: 0,
    retained: membershipStats.reduce((sum, stat) => sum + stat.retained, 0),
    retentionRate: 0,
    avgLTV: membershipStats.reduce((sum, stat) => sum + stat.totalLTV, 0) / Math.max(membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1),
    avgConversionSpan: membershipStats.reduce((sum, stat) => sum + (stat.avgConversionSpan * stat.totalClients), 0) / Math.max(membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1)
  };
  membershipTotals.conversionRate = membershipTotals.totalClients > 0 ? (membershipTotals.converted / membershipTotals.totalClients) * 100 : 0;
  membershipTotals.retentionRate = membershipTotals.totalClients > 0 ? (membershipTotals.retained / membershipTotals.totalClients) * 100 : 0;

  // Calculate totals for trainer table
  const trainerTotals = {
    trainerName: 'TOTAL',
    totalClients: trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    converted: trainerStats.reduce((sum, stat) => sum + stat.converted, 0),
    conversionRate: 0,
    retained: trainerStats.reduce((sum, stat) => sum + stat.retained, 0),
    retentionRate: 0,
    avgLTV: trainerStats.reduce((sum, stat) => sum + stat.totalLTV, 0) / Math.max(trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1),
    avgClassNo: trainerStats.reduce((sum, stat) => sum + (stat.avgClassNo * stat.totalClients), 0) / Math.max(trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1)
  };
  trainerTotals.conversionRate = trainerTotals.totalClients > 0 ? (trainerTotals.converted / trainerTotals.totalClients) * 100 : 0;
  trainerTotals.retentionRate = trainerTotals.totalClients > 0 ? (trainerTotals.retained / trainerTotals.totalClients) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Membership Performance Table */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Membership Type Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {membershipStats.length} Types
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={membershipStats.sort((a, b) => b.totalClients - a.totalClients)}
            columns={membershipColumns}
            headerGradient="from-purple-600 to-indigo-600"
            showFooter={true}
            footerData={membershipTotals}
            maxHeight="400px"
          />
        </CardContent>
      </Card>

      {/* Trainer Performance Table */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Trainer Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {trainerStats.length} Trainers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={trainerStats.sort((a, b) => b.conversionRate - a.conversionRate)}
            columns={trainerColumns}
            headerGradient="from-green-600 to-teal-600"
            showFooter={true}
            footerData={trainerTotals}
            maxHeight="400px"
          />
        </CardContent>
      </Card>
    </div>
  );
};
