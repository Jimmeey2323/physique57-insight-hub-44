
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PowerCycleVsBarreCharts } from './PowerCycleVsBarreCharts';
import { PowerCycleVsBarreTopBottomLists } from './PowerCycleVsBarreTopBottomLists';
import { PowerCycleVsBarreAdvancedMetrics } from './PowerCycleVsBarreAdvancedMetrics';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { DrillDownModal } from './DrillDownModal';
import { Eye, BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import { SessionData, TrainerFilterOptions } from '@/types/dashboard';

interface PowerCycleVsBarreSectionProps {
  data: SessionData[];
  loading?: boolean;
  onItemClick?: (item: any) => void;
}

export const PowerCycleVsBarreSection: React.FC<PowerCycleVsBarreSectionProps> = ({
  data,
  loading = false,
  onItemClick
}) => {
  const [showSourceData, setShowSourceData] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<TrainerFilterOptions>({
    dateRange: {
      start: '',
      end: ''
    },
    location: [],
    trainer: [],
    sessionType: []
  });

  // Helper function to filter data
  const applyFilters = (rawData: SessionData[]) => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    let filtered = rawData;

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    // Apply location filter
    if (filters.location?.length) {
      filtered = filtered.filter(item => filters.location!.includes(item.location));
    }

    // Apply trainer filter
    if (filters.trainer?.length) {
      filtered = filtered.filter(item => filters.trainer!.includes(item.instructor));
    }

    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data || []), [data, filters]);

  // Separate PowerCycle and Barre data
  const powerCycleData = useMemo(() => {
    return filteredData.filter(session => 
      session.cleanedClass?.toLowerCase().includes('cycle') || 
      session.classType?.toLowerCase().includes('cycle')
    );
  }, [filteredData]);

  const barreData = useMemo(() => {
    return filteredData.filter(session => 
      session.cleanedClass?.toLowerCase().includes('barre') || 
      session.classType?.toLowerCase().includes('barre')
    );
  }, [filteredData]);

  const handleItemClick = (item: any) => {
    console.log('Item clicked:', item);
    setDrillDownData(item);
    onItemClick?.(item);
  };

  return (
    <div className="space-y-8">
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-sm font-medium">
                <Target className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="overview" className="space-y-8">
          <PowerCycleVsBarreCharts 
            powerCycleData={powerCycleData} 
            barreData={barreData} 
          />
          <PowerCycleVsBarreTopBottomLists 
            powerCycleData={powerCycleData} 
            barreData={barreData} 
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-8">
          <PowerCycleVsBarreTopBottomLists 
            powerCycleData={powerCycleData} 
            barreData={barreData} 
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-8">
          <PowerCycleVsBarreAdvancedMetrics 
            data={filteredData}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {drillDownData && (
        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          type="trainer"
        />
      )}

      {showSourceData && (
        <SourceDataModal
          open={showSourceData}
          onOpenChange={setShowSourceData}
          sources={[
            {
              name: "Session Performance",
              data: data
            }
          ]}
        />
      )}
    </div>
  );
};
