
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionChartsProps {
  data: NewClientData[];
}

export const ClientConversionCharts: React.FC<ClientConversionChartsProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return { conversion: [], location: [], trainer: [], monthly: [] };

    // Conversion Status Distribution
    const conversionCounts = data.reduce((acc, client) => {
      const status = client.conversionStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conversionData = Object.entries(conversionCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Location Performance
    const locationCounts = data.reduce((acc, client) => {
      const location = client.firstVisitLocation || client.homeLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { total: 0, converted: 0 };
      }
      acc[location].total += 1;
      if (client.conversionStatus === 'Converted') {
        acc[location].converted += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; converted: number }>);

    const locationData = Object.entries(locationCounts)
      .filter(([location]) => ['Kwality House, Kemps Corner', 'Bandra West', 'Juhu'].includes(location))
      .map(([location, counts]) => ({
        name: location.split(',')[0],
        total: counts.total,
        converted: counts.converted,
        conversionRate: counts.total > 0 ? ((counts.converted / counts.total) * 100) : 0
      }));

    // Trainer Performance
    const trainerCounts = data.reduce((acc, client) => {
      const trainer = client.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = { total: 0, converted: 0, totalLTV: 0 };
      }
      acc[trainer].total += 1;
      if (client.conversionStatus === 'Converted') {
        acc[trainer].converted += 1;
      }
      acc[trainer].totalLTV += client.ltv || 0;
      return acc;
    }, {} as Record<string, { total: number; converted: number; totalLTV: number }>);

    const trainerData = Object.entries(trainerCounts)
      .map(([trainer, counts]) => ({
        name: trainer,
        total: counts.total,
        converted: counts.converted,
        conversionRate: counts.total > 0 ? ((counts.converted / counts.total) * 100) : 0,
        avgLTV: counts.total > 0 ? counts.totalLTV / counts.total : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Monthly Trend
    const monthlyData = data.reduce((acc, client) => {
      const dateStr = client.firstVisitDate;
      let date: Date;
      
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split(' ')[0].split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return acc;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthName, total: 0, converted: 0, sortKey: monthKey };
      }
      
      acc[monthKey].total += 1;
      if (client.conversionStatus === 'Converted') {
        acc[monthKey].converted += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrend = Object.values(monthlyData)
      .sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12)
      .map((item: any) => ({
        ...item,
        conversionRate: item.total > 0 ? ((item.converted / item.total) * 100) : 0
      }));

    return {
      conversion: conversionData,
      location: locationData,
      trainer: trainerData,
      monthly: monthlyTrend
    };
  }, [data]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label || data.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {typeof entry.value === 'number' ? (
                entry.dataKey.includes('Rate') || entry.dataKey.includes('percentage') 
                  ? `${Number(entry.value).toFixed(1)}%`
                  : entry.dataKey.includes('LTV') 
                    ? formatCurrency(entry.value)
                    : formatNumber(entry.value)
              ) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conversion Status Distribution */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            Conversion Status Distribution
            <Badge variant="outline" className="text-blue-600">
              {data.length} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.conversion}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {chartData.conversion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Location Performance */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Location Performance
            <Badge variant="outline" className="text-green-600">
              {chartData.location.length} Locations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.location}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#3B82F6" name="Total Clients" />
              <Bar dataKey="converted" fill="#10B981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trainer Performance */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top Trainer Performance
            <Badge variant="outline" className="text-purple-600">
              Top 10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.trainer} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversionRate" fill="#8B5CF6" name="Conversion Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Conversion Trend */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Monthly Conversion Trend
            <Badge variant="outline" className="text-orange-600">
              Last 12 Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total Clients" strokeWidth={2} />
              <Line type="monotone" dataKey="converted" stroke="#10B981" name="Converted" strokeWidth={2} />
              <Line type="monotone" dataKey="conversionRate" stroke="#EF4444" name="Conversion Rate %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
