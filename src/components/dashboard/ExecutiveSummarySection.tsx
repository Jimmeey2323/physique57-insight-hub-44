import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Home,
  ExternalLink,
  UserPlus,
  Building,
  CreditCard,
  Clock,
  Award,
  Zap,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useNavigate } from 'react-router-dom';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { DrillDownModal } from './DrillDownModal';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency, formatNumber } from '@/utils/formatters';

// Executive Summary Filter Section Component
const ExecutiveSummaryFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isCollapsed,
  onToggleCollapse 
}: {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200/50 shadow-lg mb-6">
      <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse()}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-purple-50/50 transition-colors pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Filter className="w-5 h-5" />
                Global Dashboard Filters
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  {filters && filters.dateRange && filters.dateRange.start && filters.dateRange.end ? (
                    <>
                      {new Date(filters.dateRange.start).toLocaleDateString()} - {new Date(filters.dateRange.end).toLocaleDateString()}
                    </>
                  ) : (
                    'No Date Filter'
                  )}
                </Badge>
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
              
              <div className="flex items-end">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Applies to all dashboard sections
                </Badge>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const ExecutiveSummarySection = () => {
  const navigate = useNavigate();
  const { data: salesData, loading: salesLoading } = useSalesData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: newClientData, loading: newClientLoading } = useNewClientData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  
  // Use global filters context
  const { filters: globalFilters, updateFilters, clearFilters } = useGlobalFilters();

  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    data: null,
    type: 'metric' as const
  });

  // Helper function to safely parse dates
  const safeParseDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Filter data based on global filters
  const filteredSalesData = useMemo(() => {
    if (!salesData) return [];
    return salesData.filter(sale => {
      const saleDate = safeParseDate(sale.paymentDate);
      if (!saleDate) return false;
      
      const startDate = globalFilters.dateRange.start ? safeParseDate(globalFilters.dateRange.start) : null;
      const endDate = globalFilters.dateRange.end ? safeParseDate(globalFilters.dateRange.end) : null;
      
      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      
      // Apply other filters
      if (globalFilters.location.length > 0 && !globalFilters.location.includes(sale.calculatedLocation)) return false;
      if (globalFilters.category.length > 0 && !globalFilters.category.includes(sale.cleanedCategory)) return false;
      if (globalFilters.product.length > 0 && !globalFilters.product.includes(sale.cleanedProduct)) return false;
      if (globalFilters.soldBy.length > 0 && !globalFilters.soldBy.includes(sale.soldBy)) return false;
      if (globalFilters.paymentMethod.length > 0 && !globalFilters.paymentMethod.includes(sale.paymentMethod)) return false;
      
      return true;
    });
  }, [salesData, globalFilters]);

  const filteredSessionsData = useMemo(() => {
    if (!sessionsData) return [];
    return sessionsData.filter(session => {
      const sessionDate = safeParseDate(session.date);
      if (!sessionDate) return false;
      
      const startDate = globalFilters.dateRange.start ? safeParseDate(globalFilters.dateRange.start) : null;
      const endDate = globalFilters.dateRange.end ? safeParseDate(globalFilters.dateRange.end) : null;
      
      if (startDate && sessionDate < startDate) return false;
      if (endDate && sessionDate > endDate) return false;
      
      return true;
    });
  }, [sessionsData, globalFilters]);

  const filteredNewClientData = useMemo(() => {
    if (!newClientData) return [];
    return newClientData.filter(client => {
      const clientDate = safeParseDate(client.firstVisitDate);
      if (!clientDate) return false;
      
      const startDate = globalFilters.dateRange.start ? safeParseDate(globalFilters.dateRange.start) : null;
      const endDate = globalFilters.dateRange.end ? safeParseDate(globalFilters.dateRange.end) : null;
      
      if (startDate && clientDate < startDate) return false;
      if (endDate && clientDate > endDate) return false;
      
      return true;
    });
  }, [newClientData, globalFilters]);

  const filteredLeadsData = useMemo(() => {
    if (!leadsData) return [];
    return leadsData.filter(lead => {
      const leadDate = safeParseDate(lead.createdAt);
      if (!leadDate) return false;
      
      const startDate = globalFilters.dateRange.start ? safeParseDate(globalFilters.dateRange.start) : null;
      const endDate = globalFilters.dateRange.end ? safeParseDate(globalFilters.dateRange.end) : null;
      
      if (startDate && leadDate < startDate) return false;
      if (endDate && leadDate > endDate) return false;
      
      // Apply other filters
      if (globalFilters.location.length > 0 && !globalFilters.location.includes(lead.center)) return false;
      if (globalFilters.category.length > 0 && !globalFilters.category.includes(lead.source)) return false;
      if (globalFilters.product.length > 0 && !globalFilters.product.includes(lead.stage)) return false;
      if (globalFilters.soldBy.length > 0 && !globalFilters.soldBy.includes(lead.status)) return false;
      if (globalFilters.paymentMethod.length > 0 && !globalFilters.paymentMethod.includes(lead.associate)) return false;
      
      return true;
    });
  }, [leadsData, globalFilters]);

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSalesData.reduce((sum, sale) => sum + (sale.netRevenue || 0), 0);
    const totalTransactions = filteredSalesData.length;
    const totalSessions = filteredSessionsData.length;
    const totalNewClients = filteredNewClientData.length;
    const totalLeads = filteredLeadsData.length;
    
    const avgSessionAttendance = filteredSessionsData.length > 0 
      ? filteredSessionsData.reduce((sum, session) => sum + session.checkedInCount, 0) / filteredSessionsData.length 
      : 0;

    const convertedClients = filteredNewClientData.filter(client => client.conversionStatus === 'Converted').length;
    const conversionRate = totalNewClients > 0 ? (convertedClients / totalNewClients) * 100 : 0;

    const convertedLeads = filteredLeadsData.filter(lead => lead.conversionStatus === 'Converted').length;
    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const avgTicketValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      totalSessions,
      totalNewClients,
      totalLeads,
      avgSessionAttendance,
      conversionRate,
      leadConversionRate,
      avgTicketValue,
      convertedClients,
      convertedLeads
    };
  }, [filteredSalesData, filteredSessionsData, filteredNewClientData, filteredLeadsData]);

  // Chart data preparation with safe date handling
  const revenueChartData = useMemo(() => {
    if (!filteredSalesData.length) return [];
    
    const dailyRevenue = filteredSalesData.reduce((acc, sale) => {
      const saleDate = safeParseDate(sale.paymentDate);
      if (!saleDate) return acc;
      
      const dateKey = saleDate.toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + (sale.netRevenue || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }, [filteredSalesData]);

  const sessionChartData = useMemo(() => {
    if (!filteredSessionsData.length) return [];
    
    const dailySessions = filteredSessionsData.reduce((acc, session) => {
      const sessionDate = safeParseDate(session.date);
      if (!sessionDate) return acc;
      
      const dateKey = sessionDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, sessions: 0, attendance: 0 };
      }
      acc[dateKey].sessions += 1;
      acc[dateKey].attendance += session.checkedInCount;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailySessions)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [filteredSessionsData]);

  const handleDrillDown = (data: any, type: any) => {
    setDrillDownModal({
      isOpen: true,
      data,
      type
    });
  };

  // Enhanced metric cards with animations
  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      description: 'Total revenue across all channels',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      onClick: () => handleDrillDown(filteredSalesData, 'metric')
    },
    {
      title: 'Total Transactions',
      value: formatNumber(metrics.totalTransactions),
      icon: CreditCard,
      trend: '+8.2%',
      trendUp: true,
      description: 'Completed transactions',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      onClick: () => handleDrillDown(filteredSalesData, 'metric')
    },
    {
      title: 'Active Sessions',
      value: formatNumber(metrics.totalSessions),
      icon: Activity,
      trend: '+15.3%',
      trendUp: true,
      description: 'Classes conducted',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      onClick: () => handleDrillDown(filteredSessionsData, 'metric')
    },
    {
      title: 'New Clients',
      value: formatNumber(metrics.totalNewClients),
      icon: UserPlus,
      trend: '+22.1%',
      trendUp: true,
      description: 'New member acquisitions',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      onClick: () => handleDrillDown(filteredNewClientData, 'metric')
    },
    {
      title: 'Total Leads',
      value: formatNumber(metrics.totalLeads),
      icon: Target,
      trend: '+18.7%',
      trendUp: true,
      description: 'Generated leads',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50',
      onClick: () => handleDrillDown(filteredLeadsData, 'metric')
    },
    {
      title: 'Avg Attendance',
      value: metrics.avgSessionAttendance.toFixed(1),
      icon: Users,
      trend: '+5.8%',
      trendUp: true,
      description: 'Average session attendance',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50',
      onClick: () => handleDrillDown(filteredSessionsData, 'metric')
    },
    {
      title: 'Client Conversion',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: CheckCircle,
      trend: '+3.2%',
      trendUp: true,
      description: 'Trial to member conversion',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'from-teal-50 to-cyan-50',
      onClick: () => handleDrillDown(filteredNewClientData.filter(c => c.conversionStatus === 'Converted'), 'metric')
    },
    {
      title: 'Lead Conversion',
      value: `${metrics.leadConversionRate.toFixed(1)}%`,
      icon: Zap,
      trend: '+7.4%',
      trendUp: true,
      description: 'Lead to customer conversion',
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'from-amber-50 to-yellow-50',
      onClick: () => handleDrillDown(filteredLeadsData.filter(l => l.conversionStatus === 'Converted'), 'metric')
    }
  ];

  if (salesLoading || sessionsLoading || newClientLoading || leadsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-600 font-medium text-lg">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-20 right-10 w-24 h-24 bg-purple-300/20 rounded-full"
            animate={{ 
              y: [-10, 10, -10],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute bottom-10 left-20 w-40 h-40 bg-pink-300/10 rounded-full"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Executive View
                </Badge>
                <Badge className="bg-green-500/20 backdrop-blur-sm border-green-300/30 text-green-100">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </div>
            
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Executive Dashboard
              </h1>
              <p className="text-xl text-purple-100 max-w-4xl mx-auto leading-relaxed font-medium">
                Comprehensive business intelligence with real-time metrics, revenue analytics, 
                and operational insights across all business verticals
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Global Filters */}
        <ExecutiveSummaryFilters
          filters={globalFilters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        />

        {/* Enhanced Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={card.onClick}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor} opacity-50 group-hover:opacity-70 transition-opacity`} />
                
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={card.trendUp ? "default" : "destructive"} className="gap-1">
                      {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {card.trend}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {card.title}
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform">
                      {card.value}
                    </div>
                    <p className="text-sm text-gray-500">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue Trend (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Session Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Session Activity (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sessions: {
                      label: "Sessions",
                      color: "hsl(var(--chart-2))",
                    },
                    attendance: {
                      label: "Attendance",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionChartData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Bar dataKey="sessions" fill="#8b5cf6" name="Sessions" />
                      <Bar dataKey="attendance" fill="#06b6d4" name="Attendance" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                Quick Access to Dashboard Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Sales Analytics', path: '/sales-analytics', icon: BarChart3, color: 'bg-blue-500' },
                  { name: 'Lead Performance', path: '/funnel-leads', icon: Target, color: 'bg-green-500' },
                  { name: 'Client Conversion', path: '/client-retention', icon: Users, color: 'bg-purple-500' },
                  { name: 'Trainer Performance', path: '/trainer-performance', icon: Award, color: 'bg-orange-500' },
                  { name: 'Class Attendance', path: '/class-attendance', icon: Calendar, color: 'bg-pink-500' },
                  { name: 'Discounts', path: '/discounts-promotions', icon: Percent, color: 'bg-indigo-500' }
                ].map((section, index) => (
                  <motion.div
                    key={section.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate(section.path)}
                      variant="outline"
                      className="h-20 w-full flex flex-col items-center gap-2 hover:shadow-lg transition-all duration-200"
                    >
                      <div className={`p-2 rounded-lg ${section.color} text-white`}>
                        <section.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-center">{section.name}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal(prev => ({ ...prev, isOpen: false }))}
        data={drillDownModal.data}
        type={drillDownModal.type}
      />
    </div>
  );
};

export default ExecutiveSummarySection;
