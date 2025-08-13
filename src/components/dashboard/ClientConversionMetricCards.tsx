
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, DollarSign, Percent, Clock, UserCheck, Award } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionMetricCardsProps {
  data: NewClientData[];
}

export const ClientConversionMetricCards: React.FC<ClientConversionMetricCardsProps> = ({ data }) => {
  const totalClients = data.length;
  const convertedClients = data.filter(client => client.conversionStatus === 'Converted').length;
  const retainedClients = data.filter(client => client.retentionStatus === 'Retained').length;
  const totalLTV = data.reduce((sum, client) => sum + (client.ltv || 0), 0);
  const avgLTV = totalClients > 0 ? totalLTV / totalClients : 0;
  const conversionRate = totalClients > 0 ? (convertedClients / totalClients) * 100 : 0;
  const retentionRate = totalClients > 0 ? (retainedClients / totalClients) * 100 : 0;
  const avgConversionSpan = data.length > 0 
    ? data.reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / data.length 
    : 0;

  const metrics = [
    {
      title: 'Total New Clients',
      value: formatNumber(totalClients),
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All new client acquisitions'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Target,
      gradient: 'from-green-500 to-teal-600',
      description: 'Trial to paid conversion'
    },
    {
      title: 'Retention Rate',
      value: `${retentionRate.toFixed(1)}%`,
      icon: UserCheck,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Client retention success'
    },
    {
      title: 'Average LTV',
      value: formatCurrency(avgLTV),
      icon: DollarSign,
      gradient: 'from-orange-500 to-red-600',
      description: 'Lifetime value per client'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalLTV),
      icon: TrendingUp,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Total client revenue'
    },
    {
      title: 'Avg Conversion Time',
      value: `${avgConversionSpan.toFixed(0)} days`,
      icon: Clock,
      gradient: 'from-pink-500 to-rose-600',
      description: 'Time to convert'
    },
    {
      title: 'Converted Clients',
      value: formatNumber(convertedClients),
      icon: Award,
      gradient: 'from-emerald-500 to-green-600',
      description: 'Successfully converted'
    },
    {
      title: 'Retained Clients',
      value: formatNumber(retainedClients),
      icon: Percent,
      gradient: 'from-amber-500 to-yellow-600',
      description: 'Active retained clients'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={metric.title} className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-0">
            <div className={`bg-gradient-to-r ${metric.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                <metric.icon className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <metric.icon className="w-6 h-6" />
                  <h3 className="font-semibold text-sm">{metric.title}</h3>
                </div>
                <p className="text-3xl font-bold mb-1">{metric.value}</p>
                <p className="text-sm opacity-90">{metric.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
