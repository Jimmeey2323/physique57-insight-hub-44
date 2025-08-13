
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BarChart3, Users, Target, Filter, MapPin, Building2, Home } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { SessionsFilterSection } from './SessionsFilterSection';
import { SessionsGroupedTable } from './SessionsGroupedTable';
import { SessionsMetricCards } from './SessionsMetricCards';
import { ImprovedSessionsTopBottomLists } from './ImprovedSessionsTopBottomLists';
import { SessionsQuickFilters } from './SessionsQuickFilters';
import { SessionsAttendanceAnalytics } from './SessionsAttendanceAnalytics';
import { ClassFormatAnalysis } from './ClassFormatAnalysis';
import { useNavigate } from 'react-router-dom';

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations'
}, {
  id: 'Kwality House, Kemps Corner',
  name: 'Kwality House',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'Supreme HQ, Bandra',
  name: 'Supreme HQ',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'Kenkere House',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const ClassAttendanceSection: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    refetch
  } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    locations: [] as string[],
    trainers: [] as string[],
    classes: [] as string[],
    days: [] as string[]
  });
  const [filters, setFilters] = useState({
    trainers: [] as string[],
    classTypes: [] as string[],
    dayOfWeek: [] as string[],
    timeSlots: [] as string[],
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    }
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;

    // Apply location filter
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.location === activeLocation);
    }

    // Apply quick filters
    if (quickFilters.locations.length > 0) {
      filtered = filtered.filter(item => quickFilters.locations.includes(item.location));
    }
    if (quickFilters.trainers.length > 0) {
      filtered = filtered.filter(item => quickFilters.trainers.includes(item.trainerName));
    }
    if (quickFilters.classes.length > 0) {
      filtered = filtered.filter(item => quickFilters.classes.includes(item.cleanedClass));
    }
    if (quickFilters.days.length > 0) {
      filtered = filtered.filter(item => quickFilters.days.includes(item.dayOfWeek));
    }

    // Apply advanced filters
    if (filters.trainers.length > 0) {
      filtered = filtered.filter(item => filters.trainers.includes(item.trainerName));
    }
    if (filters.classTypes.length > 0) {
      filtered = filtered.filter(item => filters.classTypes.includes(item.cleanedClass));
    }
    if (filters.dayOfWeek.length > 0) {
      filtered = filtered.filter(item => filters.dayOfWeek.includes(item.dayOfWeek));
    }
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
        return true;
      });
    }
    return filtered;
  }, [data, activeLocation, quickFilters, filters]);

  const uniqueOptions = useMemo(() => {
    if (!data) return {
      trainers: [],
      classTypes: [],
      daysOfWeek: [],
      timeSlots: [],
      locations: [],
      classes: [],
      days: []
    };
    return {
      trainers: [...new Set(data.map(item => item.trainerName))].filter(Boolean),
      classTypes: [...new Set(data.map(item => item.cleanedClass))].filter(Boolean),
      daysOfWeek: [...new Set(data.map(item => item.dayOfWeek))].filter(Boolean),
      timeSlots: [...new Set(data.map(item => item.time))].filter(Boolean),
      locations: [...new Set(data.map(item => item.location))].filter(Boolean),
      classes: [...new Set(data.map(item => item.cleanedClass))].filter(Boolean),
      days: [...new Set(data.map(item => item.dayOfWeek))].filter(Boolean)
    };
  }, [data]);

  const handleQuickFilterChange = (type: string, values: string[]) => {
    setQuickFilters(prev => ({
      ...prev,
      [type]: values
    }));
  };

  const clearQuickFilters = () => {
    setQuickFilters({
      locations: [],
      trainers: [],
      classes: [],
      days: []
    });
  };

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No class attendance data available</p>
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Location Tabs */}
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-4 w-full max-w-3xl overflow-hidden">
              {locations.map(location => <TabsTrigger key={location.id} value={location.id} className="relative rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <div className="text-center">
                      <div className="font-bold">{location.name.split(',')[0]}</div>
                      {location.name.includes(',') && <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>}
                    </div>
                  </div>
                </TabsTrigger>)}
            </TabsList>
          </div>

          {locations.map(location => <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Quick Filters */}
              <SessionsQuickFilters filters={quickFilters} options={uniqueOptions} onFilterChange={handleQuickFilterChange} onClearAll={clearQuickFilters} />

              {/* Collapsible Advanced Filters */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
                <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Filter className="w-5 h-5 text-blue-600" />
                          Advanced Filters
                        </CardTitle>
                        {isFilterExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <SessionsFilterSection filters={filters} setFilters={setFilters} options={uniqueOptions} />
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Metrics Cards */}
              <SessionsMetricCards data={filteredData} />

              {/* Top/Bottom Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImprovedSessionsTopBottomLists data={filteredData} title="Top Performing Classes" type="classes" variant="top" />
                <ImprovedSessionsTopBottomLists data={filteredData} title="Top Performing Trainers" type="trainers" variant="top" />
              </div>

              {/* Analytics Sections */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsGroupedTable data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <ClassFormatAnalysis data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsAttendanceAnalytics data={filteredData} />
              </div>
            </TabsContent>)}
        </Tabs>
      </div>
    </div>
  );
};
