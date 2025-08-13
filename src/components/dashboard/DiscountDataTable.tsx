import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Table, Users, Package, TrendingDown, ArrowUpDown } from 'lucide-react';

interface DiscountDataTableProps {
  data: SalesData[];
  filters?: any;
}

type ViewType = 'transactions' | 'products' | 'categories' | 'staff';

export const DiscountDataTable: React.FC<DiscountDataTableProps> = ({ data, filters }) => {
  const [activeView, setActiveView] = useState<ViewType>('transactions');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const tableData = useMemo(() => {
    let discountedData = data.filter(item => (item.discountAmount || 0) > 0);

    // Apply filters
    if (filters) {
      discountedData = discountedData.filter(item => {
        if (filters.location && item.calculatedLocation !== filters.location) return false;
        if (filters.category && item.cleanedCategory !== filters.category) return false;
        if (filters.product && item.cleanedProduct !== filters.product) return false;
        if (filters.soldBy && (item.soldBy === '-' ? 'Online/System' : item.soldBy) !== filters.soldBy) return false;
        if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minDiscountAmount && (item.discountAmount || 0) < filters.minDiscountAmount) return false;
        if (filters.maxDiscountAmount && (item.discountAmount || 0) > filters.maxDiscountAmount) return false;
        if (filters.minDiscountPercent && (item.discountPercentage || 0) < filters.minDiscountPercent) return false;
        if (filters.maxDiscountPercent && (item.discountPercentage || 0) > filters.maxDiscountPercent) return false;
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const itemDate = new Date(item.paymentDate);
          if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
        }
        return true;
      });
    }

    let processedData: any[] = [];
    let totalsData: any = {};

    switch (activeView) {
      case 'transactions':
        processedData = discountedData
          .map(item => ({
            date: new Date(item.paymentDate).toLocaleDateString(),
            customer: item.customerName,
            product: item.cleanedProduct,
            category: item.cleanedCategory,
            mrp: item.mrpPostTax || 0,
            discountAmount: item.discountAmount || 0,
            discountPercent: item.discountPercentage || 0,
            finalPrice: item.paymentValue || 0,
            soldBy: item.soldBy === '-' ? 'Online/System' : item.soldBy,
            paymentMethod: item.paymentMethod,
            location: item.calculatedLocation,
            membershipType: item.membershipType || 'Regular'
          }))
          .slice(0, 200); // Limit for performance

        totalsData = {
          date: 'TOTAL',
          customer: `${discountedData.length} transactions`,
          product: 'Various',
          category: 'Various',
          mrp: discountedData.reduce((sum, item) => sum + (item.mrpPostTax || 0), 0),
          discountAmount: discountedData.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
          discountPercent: discountedData.length > 0 ? discountedData.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / discountedData.length : 0,
          finalPrice: discountedData.reduce((sum, item) => sum + (item.paymentValue || 0), 0),
          soldBy: 'Various',
          paymentMethod: 'Various',
          location: 'Various',
          membershipType: 'Various'
        };
        break;

      case 'products':
        const productGroups = discountedData.reduce((acc, item) => {
          const product = item.cleanedProduct || 'Unknown';
          if (!acc[product]) {
            acc[product] = {
              product,
              category: item.cleanedCategory || 'Unknown',
              totalDiscount: 0,
              transactions: 0,
              totalRevenue: 0,
              totalMrp: 0,
              avgDiscountPercent: 0,
              maxDiscount: 0,
              customers: new Set()
            };
          }
          acc[product].totalDiscount += item.discountAmount || 0;
          acc[product].transactions += 1;
          acc[product].totalRevenue += item.paymentValue || 0;
          acc[product].totalMrp += item.mrpPostTax || 0;
          acc[product].avgDiscountPercent += item.discountPercentage || 0;
          acc[product].maxDiscount = Math.max(acc[product].maxDiscount, item.discountAmount || 0);
          acc[product].customers.add(item.customerEmail);
          return acc;
        }, {} as Record<string, any>);

        processedData = Object.values(productGroups)
          .map((item: any) => ({
            ...item,
            avgDiscount: item.totalDiscount / item.transactions,
            avgDiscountPercent: item.avgDiscountPercent / item.transactions,
            discountRate: item.totalMrp > 0 ? (item.totalDiscount / item.totalMrp) * 100 : 0,
            customers: item.customers.size
          }));

        totalsData = {
          product: 'TOTAL',
          category: 'Various',
          transactions: processedData.reduce((sum, item) => sum + item.transactions, 0),
          totalDiscount: processedData.reduce((sum, item) => sum + item.totalDiscount, 0),
          avgDiscount: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.totalDiscount, 0) / processedData.reduce((sum, item) => sum + item.transactions, 0) : 0,
          avgDiscountPercent: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.avgDiscountPercent, 0) / processedData.length : 0,
          discountRate: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.discountRate, 0) / processedData.length : 0,
          maxDiscount: Math.max(...processedData.map(item => item.maxDiscount), 0),
          customers: processedData.reduce((sum, item) => sum + item.customers, 0)
        };
        break;

      case 'categories':
        const categoryGroups = discountedData.reduce((acc, item) => {
          const category = item.cleanedCategory || 'Unknown';
          if (!acc[category]) {
            acc[category] = {
              category,
              totalDiscount: 0,
              transactions: 0,
              totalRevenue: 0,
              totalMrp: 0,
              uniqueProducts: new Set(),
              avgDiscountPercent: 0,
              customers: new Set()
            };
          }
          acc[category].totalDiscount += item.discountAmount || 0;
          acc[category].transactions += 1;
          acc[category].totalRevenue += item.paymentValue || 0;
          acc[category].totalMrp += item.mrpPostTax || 0;
          acc[category].uniqueProducts.add(item.cleanedProduct);
          acc[category].avgDiscountPercent += item.discountPercentage || 0;
          acc[category].customers.add(item.customerEmail);
          return acc;
        }, {} as Record<string, any>);

        processedData = Object.values(categoryGroups)
          .map((item: any) => ({
            ...item,
            products: item.uniqueProducts.size,
            avgDiscount: item.totalDiscount / item.transactions,
            avgDiscountPercent: item.avgDiscountPercent / item.transactions,
            discountRate: item.totalMrp > 0 ? (item.totalDiscount / item.totalMrp) * 100 : 0,
            customers: item.customers.size
          }));

        totalsData = {
          category: 'TOTAL',
          products: processedData.reduce((sum, item) => sum + item.products, 0),
          transactions: processedData.reduce((sum, item) => sum + item.transactions, 0),
          totalDiscount: processedData.reduce((sum, item) => sum + item.totalDiscount, 0),
          avgDiscount: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.totalDiscount, 0) / processedData.reduce((sum, item) => sum + item.transactions, 0) : 0,
          avgDiscountPercent: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.avgDiscountPercent, 0) / processedData.length : 0,
          discountRate: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.discountRate, 0) / processedData.length : 0,
          customers: processedData.reduce((sum, item) => sum + item.customers, 0)
        };
        break;

      case 'staff':
        const staffGroups = discountedData.reduce((acc, item) => {
          const staff = item.soldBy === '-' ? 'Online/System' : item.soldBy || 'Unknown';
          if (!acc[staff]) {
            acc[staff] = {
              staff,
              totalDiscount: 0,
              transactions: 0,
              totalRevenue: 0,
              totalMrp: 0,
              uniqueCustomers: new Set(),
              avgDiscountPercent: 0
            };
          }
          acc[staff].totalDiscount += item.discountAmount || 0;
          acc[staff].transactions += 1;
          acc[staff].totalRevenue += item.paymentValue || 0;
          acc[staff].totalMrp += item.mrpPostTax || 0;
          acc[staff].uniqueCustomers.add(item.customerEmail);
          acc[staff].avgDiscountPercent += item.discountPercentage || 0;
          return acc;
        }, {} as Record<string, any>);

        processedData = Object.values(staffGroups)
          .map((item: any) => ({
            ...item,
            customers: item.uniqueCustomers.size,
            avgDiscount: item.totalDiscount / item.transactions,
            avgDiscountPercent: item.avgDiscountPercent / item.transactions,
            discountRate: item.totalMrp > 0 ? (item.totalDiscount / item.totalMrp) * 100 : 0
          }));

        totalsData = {
          staff: 'TOTAL',
          customers: processedData.reduce((sum, item) => sum + item.customers, 0),
          transactions: processedData.reduce((sum, item) => sum + item.transactions, 0),
          totalDiscount: processedData.reduce((sum, item) => sum + item.totalDiscount, 0),
          avgDiscount: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.totalDiscount, 0) / processedData.reduce((sum, item) => sum + item.transactions, 0) : 0,
          avgDiscountPercent: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.avgDiscountPercent, 0) / processedData.length : 0,
          discountRate: processedData.length > 0 ? processedData.reduce((sum, item) => sum + item.discountRate, 0) / processedData.length : 0
        };
        break;

      default:
        return { data: [], columns: [], totals: {} };
    }

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return { data: processedData, totals: totalsData };
  }, [data, filters, activeView, sortConfig]);

  const getColumns = () => {
    switch (activeView) {
      case 'transactions':
        return [
          { key: 'date', header: 'Date', align: 'left' as const },
          { key: 'customer', header: 'Customer', align: 'left' as const },
          { key: 'product', header: 'Product', align: 'left' as const },
          { key: 'category', header: 'Category', align: 'center' as const, render: (value: string) => <Badge variant="outline">{value}</Badge> },
          { key: 'mrp', header: 'MRP', align: 'right' as const, render: (value: number) => formatCurrency(value) },
          { key: 'discountAmount', header: 'Discount', align: 'right' as const, render: (value: number) => <span className="text-red-600 font-semibold">{formatCurrency(value)}</span> },
          { key: 'discountPercent', header: 'Discount %', align: 'center' as const, render: (value: number) => <Badge variant="destructive">{value.toFixed(1)}%</Badge> },
          { key: 'finalPrice', header: 'Final Price', align: 'right' as const, render: (value: number) => formatCurrency(value) },
          { key: 'soldBy', header: 'Sold By', align: 'center' as const },
          { key: 'membershipType', header: 'Membership', align: 'center' as const, render: (value: string) => <Badge variant="secondary">{value}</Badge> },
          { key: 'location', header: 'Location', align: 'center' as const }
        ];

      case 'products':
        return [
          { key: 'product', header: 'Product', align: 'left' as const },
          { key: 'category', header: 'Category', align: 'center' as const, render: (value: string) => <Badge variant="outline">{value}</Badge> },
          { key: 'transactions', header: 'Transactions', align: 'center' as const, render: (value: number) => formatNumber(value) },
          { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const, render: (value: number) => <span className="text-red-600 font-semibold">{formatCurrency(value)}</span> },
          { key: 'avgDiscount', header: 'Avg Discount', align: 'right' as const, render: (value: number) => formatCurrency(value) },
          { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'center' as const, render: (value: number) => <Badge variant="destructive">{value.toFixed(1)}%</Badge> },
          { key: 'discountRate', header: 'Discount Rate', align: 'center' as const, render: (value: number) => `${value.toFixed(1)}%` },
          { key: 'maxDiscount', header: 'Max Discount', align: 'right' as const, render: (value: number) => formatCurrency(value) },
          { key: 'customers', header: 'Customers', align: 'center' as const, render: (value: number) => formatNumber(value) }
        ];

      case 'categories':
        return [
          { key: 'category', header: 'Category', align: 'left' as const },
          { key: 'products', header: 'Products', align: 'center' as const, render: (value: number) => formatNumber(value) },
          { key: 'transactions', header: 'Transactions', align: 'center' as const, render: (value: number) => formatNumber(value) },
          { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const, render: (value: number) => <span className="text-red-600 font-semibold">{formatCurrency(value)}</span> },
          { key: 'avgDiscount', header: 'Avg Discount', align: 'right' as const, render: (value: number) => formatCurrency(value) },
          { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'center' as const, render: (value: number) => <Badge variant="destructive">{value.toFixed(1)}%</Badge> },
          { key: 'discountRate', header: 'Discount Rate', align: 'center' as const, render: (value: number) => `${value.toFixed(1)}%` },
          { key: 'customers', header: 'Customers', align: 'center' as const, render: (value: number) => formatNumber(value) }
        ];

      case 'staff':
        return [
          { key: 'staff', header: 'Staff Member', align: 'left' as const },
          { key: 'customers', header: 'Customers', align: 'center' as const, render: (value: number) => formatNumber(value) },
          { key: 'transactions', header: 'Transactions', align: 'center' as const, render: (value: number) => formatNumber(value) },
          { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const, render: (value: number) => <span className="text-red-600 font-semibold">{formatCurrency(value)}</span> },
          { key: 'avgDiscount', header: 'Avg Discount', align: 'right' as const, render: (value: number) => formatCurrency(value) },
          { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'center' as const, render: (value: number) => <Badge variant="destructive">{value.toFixed(1)}%</Badge> },
          { key: 'discountRate', header: 'Discount Rate', align: 'center' as const, render: (value: number) => `${value.toFixed(1)}%` }
        ];

      default:
        return [];
    }
  };

  const getIcon = (view: ViewType) => {
    switch (view) {
      case 'transactions': return Table;
      case 'products': return Package;
      case 'categories': return TrendingDown;
      case 'staff': return Users;
    }
  };

  const getTitle = (view: ViewType) => {
    switch (view) {
      case 'transactions': return 'Discount Transactions';
      case 'products': return 'Product Discount Analysis';
      case 'categories': return 'Category Discount Breakdown';
      case 'staff': return 'Staff Discount Performance';
    }
  };

  const Icon = getIcon(activeView);

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-gray-50/20 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <Icon className="w-6 h-6 text-slate-600" />
            {getTitle(activeView)}
          </CardTitle>
        </div>
        
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewType)}>
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 p-1 rounded-xl shadow-sm h-auto">
            <TabsTrigger value="transactions" className="text-xs px-3 py-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs px-3 py-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs px-3 py-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Categories
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-xs px-3 py-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Staff
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        <ModernDataTable
          data={tableData.data}
          columns={getColumns()}
          showFooter={true}
          footerData={tableData.totals}
          maxHeight="600px"
          stickyHeader={true}
        />
        
        {/* Summary Footer */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">
            {getTitle(activeView)} Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Total Records:</span>
              <div className="font-semibold">{formatNumber(tableData.data.length)}</div>
            </div>
            {activeView === 'transactions' && (
              <>
                <div>
                  <span className="text-slate-600">Total Discount:</span>
                  <div className="font-semibold text-red-600">{formatCurrency(tableData.totals.discountAmount || 0)}</div>
                </div>
                <div>
                  <span className="text-slate-600">Total Revenue:</span>
                  <div className="font-semibold">{formatCurrency(tableData.totals.finalPrice || 0)}</div>
                </div>
                <div>
                  <span className="text-slate-600">Avg Discount:</span>
                  <div className="font-semibold">{tableData.totals.discountPercent?.toFixed(1)}%</div>
                </div>
              </>
            )}
            {activeView === 'products' && (
              <>
                <div>
                  <span className="text-slate-600">Total Transactions:</span>
                  <div className="font-semibold">{formatNumber(tableData.totals.transactions || 0)}</div>
                </div>
                <div>
                  <span className="text-slate-600">Total Discount:</span>
                  <div className="font-semibold text-red-600">{formatCurrency(tableData.totals.totalDiscount || 0)}</div>
                </div>
                <div>
                  <span className="text-slate-600">Customers Affected:</span>
                  <div className="font-semibold">{formatNumber(tableData.totals.customers || 0)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
