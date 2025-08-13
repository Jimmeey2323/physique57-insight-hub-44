
import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { SalesData } from '@/types/dashboard';

export const useDiscountsData = () => {
  const { data: salesData, loading, error } = useGoogleSheets();
  const [discountData, setDiscountData] = useState<SalesData[]>([]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      try {
        console.log('Processing sales data for discounts...', salesData.length, 'items');
        
        const processedData: SalesData[] = salesData.map((item: any) => {
          // Parse date correctly - handle DD/MM/YYYY HH:mm:ss format
          const parseDate = (dateStr: string) => {
            if (!dateStr) return '';
            try {
              // Split date and time if present
              const [datePart] = dateStr.split(' ');
              const [day, month, year] = datePart.split('/');
              // Create ISO date string for proper parsing
              const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              const date = new Date(isoDate);
              return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
            } catch (e) {
              console.error('Date parsing error for:', dateStr, e);
              return '';
            }
          };

          const discountAmount = parseFloat(item['Discount Amount -Mrp- Payment Value'] || '0') || 0;
          const discountPercentage = parseFloat(item['Discount Percentage - discount amount/mrp*100'] || '0') || 0;
          
          return {
            memberId: item['Member ID']?.toString() || '',
            customerName: item['Customer Name'] || '',
            customerEmail: item['Customer Email'] || '',
            saleItemId: item['Sale Item ID']?.toString() || '',
            paymentCategory: item['Payment Category'] || '',
            membershipType: item['Membership Type'] || '',
            paymentDate: parseDate(item['Payment Date'] || ''),
            paymentValue: parseFloat(item['Payment Value'] || '0') || 0,
            paidInMoneyCredits: parseFloat(item['Paid In Money Credits'] || '0') || 0,
            paymentVAT: parseFloat(item['Payment VAT'] || '0') || 0,
            paymentItem: item['Payment Item'] || '',
            paymentStatus: item['Payment Status'] || '',
            paymentMethod: item['Payment Method'] || '',
            paymentTransactionId: item['Payment Transaction ID']?.toString() || '',
            stripeToken: item['Stripe Token'] || '',
            soldBy: item['Sold By'] || '',
            saleReference: item['Sale Reference']?.toString() || '',
            calculatedLocation: item['Calculated Location'] || '',
            cleanedProduct: item['Cleaned Product'] || '',
            cleanedCategory: item['Cleaned Category'] || '',
            hostId: item['Host Id']?.toString() || '',
            mrpPreTax: parseFloat(item['Mrp - Pre Tax'] || '0') || 0,
            mrpPostTax: parseFloat(item['Mrp - Post Tax'] || '0') || 0,
            discountAmount,
            discountPercentage,
            netRevenue: (parseFloat(item['Payment Value'] || '0') || 0) - (parseFloat(item['Payment VAT'] || '0') || 0),
            vat: parseFloat(item['Payment VAT'] || '0') || 0,
            grossRevenue: parseFloat(item['Payment Value'] || '0') || 0,
          };
        });

        console.log('Processed discount data:', processedData.length, 'items');
        console.log('Sample processed item:', processedData[0]);
        setDiscountData(processedData);
      } catch (error) {
        console.error('Error processing discount data:', error);
        setDiscountData([]);
      }
    }
  }, [salesData]);

  return {
    data: discountData,
    loading,
    error,
  };
};
