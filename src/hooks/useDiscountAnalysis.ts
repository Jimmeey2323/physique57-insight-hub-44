
import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { SalesData } from '@/types/dashboard';

export interface DiscountAnalysisData {
  memberId: string;
  customerName: string;
  customerEmail: string;
  paymentDate: string;
  paymentValue: number;
  paymentItem: string;
  paymentMethod: string;
  soldBy: string;
  location: string;
  cleanedProduct: string;
  cleanedCategory: string;
  mrpPreTax: number;
  mrpPostTax: number;
  discountAmount: number;
  discountPercentage: number;
  membershipType: string;
}

export const useDiscountAnalysis = () => {
  const { data: salesData, loading, error } = useGoogleSheets();
  const [discountData, setDiscountData] = useState<DiscountAnalysisData[]>([]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      try {
        const processedData: DiscountAnalysisData[] = salesData.map((item: any) => ({
          memberId: item.memberId || item['Member ID'] || '',
          customerName: item.customerName || item['Customer Name'] || '',
          customerEmail: item.customerEmail || item['Customer Email'] || '',
          paymentDate: item.paymentDate || item['Payment Date'] || '',
          paymentValue: item.paymentValue || item['Payment Value'] || 0,
          paymentItem: item.paymentItem || item['Payment Item'] || '',
          paymentMethod: item.paymentMethod || item['Payment Method'] || '',
          soldBy: item.soldBy || item['Sold By'] || '',
          location: item.calculatedLocation || item['Calculated Location'] || '',
          cleanedProduct: item.cleanedProduct || item['Cleaned Product'] || '',
          cleanedCategory: item.cleanedCategory || item['Cleaned Category'] || '',
          mrpPreTax: item['mrp-PreTax'] || item['Mrp - Pre Tax'] || 0,
          mrpPostTax: item['mrp-PostTax'] || item['Mrp - Post Tax'] || 0,
          discountAmount: item['discountAmount-Mrp-PaymentValue'] || item['Discount Amount -Mrp- Payment Value'] || 0,
          discountPercentage: item['discountPercentage-discountAmount/mrp*100'] || item['Discount Percentage - discount amount/mrp*100'] || 0,
          membershipType: item.membershipType || item['Membership Type'] || '',
        }));

        // Filter for transactions with discounts
        const discountedTransactions = processedData.filter(item => 
          item.discountAmount > 0 || item.discountPercentage > 0
        );

        console.log('Discount Analysis - Total transactions:', processedData.length);
        console.log('Discount Analysis - Discounted transactions:', discountedTransactions.length);

        setDiscountData(discountedTransactions);
      } catch (error) {
        console.error('Error processing discount data:', error);
        setDiscountData([]);
      }
    }
  }, [salesData]);

  // Calculate discount metrics
  const metrics = useMemo(() => {
    if (!discountData.length) {
      console.log('No discount data available for metrics calculation');
      return {
        totalDiscountAmount: 0,
        totalRevenueLost: 0,
        totalTransactions: 0,
        avgDiscountPercentage: 0,
        totalPotentialRevenue: 0,
        totalActualRevenue: 0,
        discountEffectiveness: 0,
        productBreakdown: [],
        monthlyBreakdown: [],
      };
    }

    const totalDiscountAmount = discountData.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalRevenueLost = discountData.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTransactions = discountData.length;
    const avgDiscountPercentage = discountData.reduce((sum, item) => sum + item.discountPercentage, 0) / totalTransactions;
    const totalPotentialRevenue = discountData.reduce((sum, item) => sum + item.mrpPreTax, 0);
    const totalActualRevenue = discountData.reduce((sum, item) => sum + item.paymentValue, 0);

    // Group by product
    const productBreakdown = discountData.reduce((acc, item) => {
      const key = item.cleanedProduct || 'Unknown Product';
      if (!acc[key]) {
        acc[key] = {
          product: key,
          transactions: 0,
          totalDiscount: 0,
          avgDiscountPercentage: 0,
          revenue: 0,
        };
      }
      acc[key].transactions += 1;
      acc[key].totalDiscount += item.discountAmount;
      acc[key].revenue += item.paymentValue;
      return acc;
    }, {} as Record<string, any>);

    // Calculate average discount percentage for each product
    Object.values(productBreakdown).forEach((product: any) => {
      const productTransactions = discountData.filter(item => item.cleanedProduct === product.product);
      product.avgDiscountPercentage = productTransactions.reduce((sum, item) => sum + item.discountPercentage, 0) / productTransactions.length;
    });

    // Group by month
    const monthlyBreakdown = discountData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          transactions: 0,
          totalDiscount: 0,
          revenue: 0,
        };
      }
      acc[monthKey].transactions += 1;
      acc[monthKey].totalDiscount += item.discountAmount;
      acc[monthKey].revenue += item.paymentValue;
      return acc;
    }, {} as Record<string, any>);

    const calculatedMetrics = {
      totalDiscountAmount,
      totalRevenueLost,
      totalTransactions,
      avgDiscountPercentage,
      totalPotentialRevenue,
      totalActualRevenue,
      discountEffectiveness: totalPotentialRevenue > 0 ? (totalActualRevenue / totalPotentialRevenue) * 100 : 0,
      productBreakdown: Object.values(productBreakdown),
      monthlyBreakdown: Object.values(monthlyBreakdown),
    };

    console.log('Discount Metrics:', calculatedMetrics);
    return calculatedMetrics;
  }, [discountData]);

  return {
    data: discountData,
    metrics,
    loading,
    error,
  };
};
