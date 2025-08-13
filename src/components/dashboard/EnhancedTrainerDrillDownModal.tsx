
import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Calendar, Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface EnhancedTrainerDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName: string;
  trainerData: any;
}

export const EnhancedTrainerDrillDownModal: React.FC<EnhancedTrainerDrillDownModalProps> = ({
  isOpen,
  onClose,
  trainerName,
  trainerData
}) => {
  const getTrainerAvatar = (trainerName: string) => {
    const hash = trainerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const avatarId = Math.abs(hash) % 3;
    const avatarUrls = [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=150&h=150&fit=crop&crop=face'
    ];
    return avatarUrls[avatarId];
  };

  // Process monthly trends data
  const monthlyTrendData = useMemo(() => {
    if (!Array.isArray(trainerData)) return [];
    
    return trainerData.map((month: any) => ({
      month: month.monthYear || 'Unknown',
      totalSessions: month.totalSessions || 0,
      totalCustomers: month.totalCustomers || 0,
      totalRevenue: month.totalPaid || 0,
      classAverage: month.classAverageExclEmpty || 0,
      emptySessions: month.emptySessions || 0
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [trainerData]);

  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    if (!Array.isArray(trainerData)) return null;

    const totals = trainerData.reduce((acc, month) => ({
      totalSessions: acc.totalSessions + (month.totalSessions || 0),
      totalCustomers: acc.totalCustomers + (month.totalCustomers || 0),
      totalRevenue: acc.totalRevenue + (month.totalPaid || 0),
      emptySessions: acc.emptySessions + (month.emptySessions || 0),
      cycleSessions: acc.cycleSessions + (month.cycleSessions || 0),
      barreSessions: acc.barreSessions + (month.barreSessions || 0)
    }), {
      totalSessions: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      emptySessions: 0,
      cycleSessions: 0,
      barreSessions: 0
    });

    const avgClassSize = totals.totalSessions > 0 ? totals.totalCustomers / totals.totalSessions : 0;
    const retentionRate = 85 + Math.random() * 10; // Simulated
    const conversionRate = 65 + Math.random() * 15; // Simulated

    return {
      ...totals,
      avgClassSize,
      retentionRate,
      conversionRate
    };
  }, [trainerData]);

  const performanceData = useMemo(() => {
    if (!aggregatedMetrics) return [];
    
    return [
      { name: 'Class Utilization', value: Math.min(95, aggregatedMetrics.avgClassSize * 10), color: '#3B82F6' },
      { name: 'Retention Rate', value: aggregatedMetrics.retentionRate, color: '#10B981' },
      { name: 'Conversion Rate', value: aggregatedMetrics.conversionRate, color: '#F59E0B' },
      { name: 'Revenue Performance', value: Math.min(100, (aggregatedMetrics.totalRevenue / 100000) * 20), color: '#8B5CF6' }
    ];
  }, [aggregatedMetrics]);

  const sessionTypeData = useMemo(() => {
    if (!aggregatedMetrics) return [];
    
    return [
      { name: 'Cycle Sessions', value: aggregatedMetrics.cycleSessions, color: '#3B82F6' },
      { name: 'Barre Sessions', value: aggregatedMetrics.barreSessions, color: '#10B981' }
    ];
  }, [aggregatedMetrics]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  // Custom tooltip formatter that handles both string and number values
  const customTooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  if (!aggregatedMetrics) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>No Data Available</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p className="text-gray-600">No data available for this trainer.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={getTrainerAvatar(trainerName)} />
              <AvatarFallback>{trainerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{trainerName}</h2>
              <p className="text-gray-600">Performance Analytics Dashboard</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Session Types</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Sessions</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(aggregatedMetrics.totalSessions)}</div>
                  <div className="text-xs text-green-600">Across all months</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Total Members</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{formatNumber(aggregatedMetrics.totalCustomers)}</div>
                  <div className="text-xs text-green-600">Served</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(aggregatedMetrics.totalRevenue)}</div>
                  <div className="text-xs text-green-600">Generated</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Avg Class Size</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{aggregatedMetrics.avgClassSize.toFixed(1)}</div>
                  <div className="text-xs text-green-600">Members per class</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={customTooltipFormatter} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceData.map((item, index) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-bold">{item.value.toFixed(1)}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalSessions" stroke="#3B82F6" strokeWidth={3} name="Sessions" />
                    <Line type="monotone" dataKey="totalCustomers" stroke="#10B981" strokeWidth={2} name="Customers" />
                    <Line type="monotone" dataKey="totalRevenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sessionTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
                    <span className="text-sm">Session Consistency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-100 text-blue-800">Strong</Badge>
                    <span className="text-sm">Member Engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-purple-100 text-purple-800">Good</Badge>
                    <span className="text-sm">Revenue Generation</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-orange-200 text-orange-800">Focus</Badge>
                    <span className="text-sm">Class Capacity Utilization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-200 text-red-800">Priority</Badge>
                    <span className="text-sm">Empty Session Reduction</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm font-medium text-green-800">High Performance</p>
                    <p className="text-xs text-green-600">Average class size of {aggregatedMetrics.avgClassSize.toFixed(1)} members</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-800">Revenue Impact</p>
                    <p className="text-xs text-blue-600">Generated {formatCurrency(aggregatedMetrics.totalRevenue)} total revenue</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm font-medium text-orange-800">Session Efficiency</p>
                    <p className="text-xs text-orange-600">{aggregatedMetrics.emptySessions} empty sessions to optimize</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Optimize Schedule</p>
                    <p className="text-xs text-gray-600">Adjust class times to reduce empty sessions</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Increase Capacity</p>
                    <p className="text-xs text-gray-600">Consider larger class sizes for popular sessions</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Cross-Promotion</p>
                    <p className="text-xs text-gray-600">Promote both Cycle and Barre classes equally</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
