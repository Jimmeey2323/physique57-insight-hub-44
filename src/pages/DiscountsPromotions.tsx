
import React, { useEffect, useMemo } from 'react';
import DiscountsSection from '@/components/dashboard/DiscountsSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Tag, TrendingDown, Users, Percent, DollarSign } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

const DiscountsPromotions = () => {
  const { data, loading } = useDiscountsData();
  const { isLoading: globalLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(loading, 'Loading discount and promotional data...');
  }, [loading, setLoading]);

  // Calculate key metrics for hero section
  const heroMetrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalDiscountValue: 0,
        discountedTransactions: 0,
        avgDiscountPercentage: 0,
        uniqueMembers: 0,
        unitsSold: 0,
        totalRevenueLost: 0
      };
    }

    const discountedData = data.filter(item => (item.discountAmount || 0) > 0);
    
    const totalDiscountValue = discountedData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const discountedTransactions = discountedData.length;
    const uniqueMembers = new Set(discountedData.map(item => item.customerEmail)).size;
    const unitsSold = discountedData.length; // Each transaction represents units sold
    const totalDiscountPercentages = discountedData.reduce((sum, item) => sum + (item.discountPercentage || 0), 0);
    const avgDiscountPercentage = discountedTransactions > 0 ? totalDiscountPercentages / discountedTransactions : 0;
    const totalRevenueLost = discountedData.reduce((sum, item) => sum + ((item.mrpPostTax || item.mrpPreTax || item.paymentValue || 0) - (item.paymentValue || 0)), 0);

    return {
      totalDiscountValue,
      discountedTransactions,
      avgDiscountPercentage,
      uniqueMembers,
      unitsSold,
      totalRevenueLost
    };
  }, [data]);

  if (globalLoading) {
    return <RefinedLoader subtitle="Loading discount and promotional data..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* Enhanced Hero Section with Animated Metrics */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800 via-red-800 to-pink-800">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          {/* Dashboard Button - Top Left */}
          <div className="absolute top-6 left-6">
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>

          <div className="text-center space-y-6 pt-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 animate-fade-in-up">
              <Tag className="w-5 h-5 text-orange-300" />
              <span className="font-medium text-gray-50 uppercase">Discount Analytics</span>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent animate-fade-in-up delay-200 md:text-7xl">
              Discounts & Promotions
            </h1>
            
            <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              Comprehensive analysis of discount strategies and promotional impact across all sales channels
            </p>

            {/* Animated Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 animate-fade-in-up delay-500">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-red-300" />
                  <span className="text-xs text-orange-200 uppercase font-medium">Discount Value</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(heroMetrics.totalDiscountValue)}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs text-orange-200 uppercase font-medium">Transactions</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(heroMetrics.discountedTransactions)}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-green-300" />
                  <span className="text-xs text-orange-200 uppercase font-medium">Avg Discount</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {heroMetrics.avgDiscountPercentage.toFixed(1)}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-300" />
                  <span className="text-xs text-orange-200 uppercase font-medium">Members</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(heroMetrics.uniqueMembers)}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-purple-300" />
                  <span className="text-xs text-orange-200 uppercase font-medium">Units Sold</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(heroMetrics.unitsSold)}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-300" />
                  <span className="text-xs text-orange-200 uppercase font-medium">Revenue Lost</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(heroMetrics.totalRevenueLost)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <DiscountsSection />
        </main>
      </div>
      
      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default DiscountsPromotions;
