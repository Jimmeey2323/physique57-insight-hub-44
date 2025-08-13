
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2 } from 'lucide-react';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionLocationSelectorProps {
  data: NewClientData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const ClientConversionLocationSelector: React.FC<ClientConversionLocationSelectorProps> = ({
  data,
  selectedLocation,
  onLocationChange
}) => {
  const locationCounts = React.useMemo(() => {
    // Use the correct location names matching sales tab
    const mainLocations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House, Bengaluru'];
    
    const counts = data.reduce((acc, client) => {
      const location = client.firstVisitLocation || client.homeLocation || 'Unknown';
      if (mainLocations.includes(location)) {
        acc[location] = (acc[location] || 0) + 1;
      } else {
        acc['Other'] = (acc['Other'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalCount = data.length;
    counts['All Locations'] = totalCount;

    return counts;
  }, [data]);

  const locations = [
    { key: 'All Locations', display: 'All Locations', icon: Building2 },
    { key: 'Kwality House, Kemps Corner', display: 'Kemps Corner', icon: MapPin },
    { key: 'Supreme HQ, Bandra', display: 'Bandra West', icon: MapPin },
    { key: 'Kenkere House, Bengaluru', display: 'Bengaluru', icon: MapPin }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Location Analysis</h3>
            <p className="text-sm text-slate-600">Client distribution across studio locations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map(location => {
            const count = locationCounts[location.key] || 0;
            const isSelected = selectedLocation === location.key;
            const IconComponent = location.icon;
            
            return (
              <Button
                key={location.key}
                variant={isSelected ? "default" : "outline"}
                onClick={() => onLocationChange(location.key)}
                className={`group relative h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 overflow-hidden ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl border-0 scale-105' 
                    : 'hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <span className="text-sm font-semibold">{location.display}</span>
                  <Badge 
                    variant={isSelected ? "secondary" : "outline"}
                    className={`text-xs transition-colors ${
                      isSelected 
                        ? "bg-white/20 text-white border-white/30" 
                        : "text-slate-600 border-slate-300 group-hover:border-blue-400 group-hover:text-blue-700"
                    }`}
                  >
                    {count.toLocaleString()}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
