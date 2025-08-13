
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Target, Award, Activity, Zap } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface MetricCardData {
  title: string;
  value: string;
  change: number;
  description: string;
  calculation: string;
  icon: 'sessions' | 'members' | 'revenue' | 'retention' | 'conversion' | 'efficiency';
}

interface EnhancedTrainerMetricCardsProps {
  cards: MetricCardData[];
}

const iconMap = {
  sessions: { Icon: Calendar, color: 'from-blue-500 to-cyan-600' },
  members: { Icon: Users, color: 'from-green-500 to-emerald-600' },
  revenue: { Icon: DollarSign, color: 'from-purple-500 to-violet-600' },
  retention: { Icon: Award, color: 'from-pink-500 to-rose-600' },
  conversion: { Icon: Target, color: 'from-orange-500 to-red-600' },
  efficiency: { Icon: Zap, color: 'from-indigo-500 to-blue-600' }
};

export const EnhancedTrainerMetricCards: React.FC<EnhancedTrainerMetricCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const { Icon, color } = iconMap[card.icon];
        const isPositive = card.change >= 0;
        
        return (
          <Card 
            key={card.title}
            className={cn(
              "group relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2",
              `animate-fade-in delay-${index * 100}`
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
              color
            )} />
            
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                  color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-2 py-1",
                    isPositive 
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(card.change).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                  {card.value}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-mono">
                  {card.calculation}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
