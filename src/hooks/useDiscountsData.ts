
import { useState, useEffect } from 'react';
import { SalesData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

// Correct spreadsheet ID for discounts from Sales sheet
const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useDiscountsData = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      console.log('Access token obtained for discounts data');
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchDiscountsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching discount data from Sales sheet...');
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sales?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sales data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const rows = result.values || [];
      
      console.log(`Fetched ${rows.length} rows from Sales sheet`);
      console.log('Headers:', rows[0]);
      console.log('Sample rows:', rows.slice(1, 6));
      
      if (rows.length < 2) {
        console.log('No data rows found');
        setData([]);
        return;
      }

      // Map according to the provided Sales sheet structure
      const salesData: SalesData[] = rows.slice(1).map((row: any[], index: number) => {
        try {
          // Parse discount amount and percentage safely
          const discountAmount = parseNumericValue(row[22]); // Column 23: Discount Amount -Mrp- Payment Value
          const discountPercentage = parseNumericValue(row[23]); // Column 24: Discount Percentage
          const mrpPreTax = parseNumericValue(row[20]); // Column 21: Mrp - Pre Tax
          const mrpPostTax = parseNumericValue(row[21]); // Column 22: Mrp - Post Tax
          const paymentValue = parseNumericValue(row[6]); // Column 7: Payment Value
          const paymentVAT = parseNumericValue(row[8]); // Column 9: Payment VAT

          // Only include records where we have actual transaction data
          if (!row[0] || !paymentValue) {
            return null;
          }

          return {
            // Column mapping based on provided structure (0-based indexing)
            memberId: String(row[0] || ''), // Column 1: Member ID
            customerName: String(row[1] || ''), // Column 2: Customer Name
            customerEmail: String(row[2] || ''), // Column 3: Customer Email
            saleItemId: String(row[3] || ''), // Column 4: Sale Item ID
            paymentCategory: String(row[4] || ''), // Column 5: Payment Category
            paymentDate: String(row[5] || ''), // Column 6: Payment Date
            paymentValue: paymentValue, // Column 7: Payment Value
            paidInMoneyCredits: parseNumericValue(row[7]), // Column 8: Paid In Money Credits
            paymentVAT: paymentVAT, // Column 9: Payment VAT
            paymentItem: String(row[9] || ''), // Column 10: Payment Item
            paymentMethod: String(row[10] || ''), // Column 11: Payment Method
            paymentStatus: String(row[11] || ''), // Column 12: Payment Status
            paymentTransactionId: String(row[12] || ''), // Column 13: Payment Transaction ID
            stripeToken: String(row[13] || ''), // Column 14: Stripe Token
            soldBy: String(row[14] || ''), // Column 15: Sold By
            saleReference: String(row[15] || ''), // Column 16: Sale Reference
            calculatedLocation: String(row[16] || ''), // Column 17: Calculated Location
            cleanedProduct: String(row[17] || ''), // Column 18: Cleaned Product
            cleanedCategory: String(row[18] || ''), // Column 19: Cleaned Category
            membershipType: String(row[24] || ''), // Column 25: Membership Type
            // Discount-specific fields
            mrpPreTax: mrpPreTax, // Column 21: Mrp - Pre Tax
            mrpPostTax: mrpPostTax, // Column 22: Mrp - Post Tax
            discountAmount: Math.abs(discountAmount), // Column 23: Discount Amount (absolute value)
            discountPercentage: Math.abs(discountPercentage), // Column 24: Discount Percentage (absolute value)
            grossRevenue: mrpPostTax || mrpPreTax || paymentValue, // Use Post Tax MRP, fallback to Pre Tax, then Payment Value
            vat: paymentVAT, // Payment VAT
            netRevenue: paymentValue, // Payment Value as net revenue
            hostId: String(row[19] || ''), // Column 20: Host Id
          };
        } catch (err) {
          console.error(`Error parsing row ${index + 1}:`, err, row);
          return null;
        }
      }).filter(Boolean) as SalesData[];

      console.log('Total sales data loaded:', salesData.length, 'records');
      
      // Filter and log discount data
      const discountedItems = salesData.filter(item => item.discountAmount && item.discountAmount > 0);
      const negativeDiscountItems = salesData.filter(item => item.discountAmount && item.discountAmount < 0);
      
      console.log('Items with positive discounts:', discountedItems.length);
      console.log('Items with negative discount amounts (refunds/credits):', negativeDiscountItems.length);
      
      // Log sample discount data for debugging
      if (discountedItems.length > 0) {
        console.log('Sample discount data:', discountedItems.slice(0, 3).map(item => ({
          product: item.cleanedProduct,
          customer: item.customerName,
          discountAmount: item.discountAmount,
          discountPercentage: item.discountPercentage,
          paymentValue: item.paymentValue,
          mrpPreTax: item.mrpPreTax,
          mrpPostTax: item.mrpPostTax,
          rawDiscountCol: item.discountAmount // This should show the raw parsed value
        })));
      }
      
      // Log some non-discount items for comparison
      const nonDiscountItems = salesData.filter(item => !item.discountAmount || item.discountAmount === 0);
      console.log('Items without discounts:', nonDiscountItems.length);
      
      setData(salesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountsData();
  }, []);

  return { data, loading, error, refetch: fetchDiscountsData };
};
