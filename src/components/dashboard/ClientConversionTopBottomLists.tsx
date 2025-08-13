
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Eye, ChevronRight } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionTopBottomListsProps {
  data: NewClientData[];
  onItemClick?: (item: any) => void;
}

export const ClientConversionTopBottomLists: React.FC<ClientConversionTopBottomListsProps> = ({
  data,
  onItemClick
}) => {
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');
  const [showCount, setShowCount] = useState(5);

  // Trainer performance analysis
  const trainerStats = data.reduce((acc, client) => {
    const trainer = client.trainerName || 'Unknown';
    if (!acc[trainer]) {
      acc[trainer] = {
        name: trainer,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        avgLTV: 0
      };
    }
    
    acc[trainer].newClients++;
    if (client.conversionStatus === 'Converted') acc[trainer].conversions++;
    if (client.retentionStatus === 'Retained') acc[trainer].retained++;
    acc[trainer].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate rates
  Object.values(trainerStats).forEach((stats: any) => {
    stats.conversionRate = stats.newClients > 0 ? (stats.conversions / stats.newClients) * 100 : 0;
    stats.avgLTV = stats.newClients > 0 ? stats.totalLTV / stats.newClients : 0;
  });

  const trainerList = Object.values(trainerStats) as any[];

  // Location performance analysis
  const locationStats = data.reduce((acc, client) => {
    const location = client.firstVisitLocation || 'Unknown';
    if (!acc[location]) {
      acc[location] = {
        name: location,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        avgLTV: 0
      };
    }
    
    acc[location].newClients++;
    if (client.conversionStatus === 'Converted') acc[location].conversions++;
    if (client.retentionStatus === 'Retained') acc[location].retained++;
    acc[location].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate rates for locations
  Object.values(locationStats).forEach((stats: any) => {
    stats.conversionRate = stats.newClients > 0 ? (stats.conversions / stats.newClients) * 100 : 0;
    stats.avgLTV = stats.newClients > 0 ? stats.totalLTV / stats.newClients : 0;
  });

  const locationList = Object.values(locationStats) as any[];

  const sortItems = (items: any[], metric: string) => {
    return [...items].sort((a, b) => {
      const aValue = a[metric] || 0;
      const bValue = b[metric] || 0;
      return viewMode === 'top' ? bValue - aValue : aValue - bValue;
    });
  };

  const handleItemClick = (item: any, type: string) => {
    onItemClick?.({ ...item, type });
  };

  const renderList = (items: any[], type: string, metric: string) => {
    const sortedItems = sortItems(items, metric).slice(0, showCount);
    
    return (
      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div 
            key={item.name}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 cursor-pointer group"
            onClick={() => handleItemClick(item, type)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                viewMode === 'top' 
                  ? index < 3 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                  : index < 3
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm truncate max-w-[150px]" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(item.newClients)} clients • {item.conversionRate.toFixed(1)}% conv
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-gray-800 text-sm">
                  {metric === 'totalLTV' ? formatCurrency(item[metric]) : 
                   metric === 'conversionRate' ? `${item[metric].toFixed(1)}%` :
                   formatNumber(item[metric])}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(item.avgLTV)} avg LTV
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Trainers */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Trainer Performance
            </CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 px-3 py-1">
              {trainerList.length} Trainers
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'top' | 'bottom')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="top" className="text-xs font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Top Performers
              </TabsTrigger>
              <TabsTrigger value="bottom" className="text-xs font-medium">
                <TrendingDown className="w-3 h-3 mr-1" />
                Need Support
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {renderList(trainerList, 'trainer', 'conversionRate')}
          
          {trainerList.length > showCount && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCount(prev => prev + 5)}
                className="w-full text-xs hover:bg-blue-50"
              >
                <Eye className="w-3 h-3 mr-1" />
                Show More Trainers
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Locations */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Location Performance
            </CardTitle>
            <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 px-3 py-1">
              {locationList.length} Locations
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'top' | 'bottom')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="top" className="text-xs font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Top Locations
              </TabsTrigger>
              <TabsTrigger value="bottom" className="text-xs font-medium">
                <TrendingDown className="w-3 h-3 mr-1" />
                Need Focus
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {renderList(locationList, 'location', 'totalLTV')}
          
          {locationList.length > showCount && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCount(prev => prev + 5)}
                className="w-full text-xs hover:bg-blue-50"
              >
                <Eye className="w-3 h-3 mr-1" />
                Show More Locations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
