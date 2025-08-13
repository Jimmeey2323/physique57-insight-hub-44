
import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Home, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/utils/formatters';
import { designTokens } from '@/utils/designTokens';
import { cn } from '@/lib/utils';

interface ModernHeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  badgeText: string;
  badgeIcon: LucideIcon;
  gradient: keyof typeof designTokens.gradients;
  stats?: Array<{
    value: string;
    label: string;
    icon?: LucideIcon;
  }>;
  className?: string;
}

export const ModernHeroSection: React.FC<ModernHeroSectionProps> = ({
  title,
  subtitle,
  description,
  badgeText,
  badgeIcon: BadgeIcon,
  gradient,
  stats = [],
  className
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "relative overflow-hidden",
      designTokens.gradients[gradient],
      "text-white",
      className
    )}>
      {/* Modern geometric background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 right-20 w-80 h-80 bg-white/15 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
      </div>
      
      <div className="relative px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
          
          {/* Hero Content */}
          <div className="text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 border border-white/30 animate-fade-in">
              <BadgeIcon className="w-5 h-5" />
              <span className="font-semibold text-white">{badgeText}</span>
            </div>
            
            {/* Title */}
            <div className="space-y-2 animate-fade-in delay-200">
              <h1 className={cn(
                designTokens.typography.display,
                "bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl md:text-2xl font-medium text-white/90">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300">
              {description}
            </p>
            
            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fade-in delay-500">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      {stat.icon && (
                        <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base text-white/70 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
    </div>
  );
};
