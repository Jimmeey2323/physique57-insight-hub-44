
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExecutiveFiltersProps {
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

export const ExecutiveFilters: React.FC<ExecutiveFiltersProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | null) => {
    onDateRangeChange({
      ...dateRange,
      [type]: date
    });
  };

  const clearDateRange = () => {
    onDateRangeChange({ start: null, end: null });
  };

  const activeFilterCount = (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Executive Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-blue-600 text-white">
                    {activeFilterCount} Active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDateRange();
                    }}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Start Date
                  </label>
                  {dateRange.start && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangeChange('start', null)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start 
                        ? format(dateRange.start, 'PPP')
                        : 'Select start date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.start || undefined}
                      onSelect={(date) => handleDateRangeChange('start', date || null)}
                      disabled={(date) => 
                        dateRange.end 
                          ? date > dateRange.end 
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">Filter data from this date</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    End Date
                  </label>
                  {dateRange.end && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangeChange('end', null)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end 
                        ? format(dateRange.end, 'PPP')
                        : 'Select end date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.end || undefined}
                      onSelect={(date) => handleDateRangeChange('end', date || null)}
                      disabled={(date) => 
                        dateRange.start 
                          ? date < dateRange.start 
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">Filter data up to this date</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
