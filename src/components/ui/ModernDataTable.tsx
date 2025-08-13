
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
}

interface ModernDataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  stickyHeader?: boolean;
  showFooter?: boolean;
  footerData?: any;
  maxHeight?: string;
  className?: string;
  headerGradient?: string;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const ModernDataTable: React.FC<ModernDataTableProps> = ({
  data,
  columns,
  loading = false,
  stickyHeader = false,
  showFooter = false,
  footerData,
  maxHeight,
  className,
  headerGradient = "from-slate-600 to-slate-700",
  onSort,
  sortField,
  sortDirection
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrencyValue = (value: any) => {
    if (typeof value === 'string' && (value.includes('₹') || value.includes('$'))) {
      const numericValue = parseFloat(value.replace(/[₹$,]/g, ''));
      if (!isNaN(numericValue) && numericValue < 1000) {
        return `₹${Math.round(numericValue)}`;
      }
    }
    return value;
  };

  const handleSort = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className={cn("relative overflow-auto border border-slate-200 rounded-lg", className)} style={{ maxHeight }}>
      <Table className="w-full">
        <TableHeader className={cn(
          "sticky top-0 z-20",
          stickyHeader && "sticky top-0 z-20"
        )}>
          <TableRow className={cn(
            "bg-gradient-to-r text-white border-none h-8",
            headerGradient
          )}>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(
                  "font-bold text-white h-8 px-3 text-xs whitespace-nowrap",
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer hover:bg-white/10',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortField === column.key && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-3 h-3" /> : 
                      <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index} 
              className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 h-8"
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "h-8 px-3 py-1 text-xs text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  {column.render 
                    ? column.render(row[column.key], row)
                    : formatCurrencyValue(row[column.key])
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {showFooter && footerData && (
          <TableFooter className="sticky bottom-0 z-10 bg-slate-900 border-t-2 border-slate-700">
            <TableRow className="hover:bg-slate-800 h-8 border-none">
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "font-bold text-white h-8 px-3 py-1 text-xs whitespace-nowrap",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  {column.render 
                    ? column.render(footerData[column.key], footerData)
                    : formatCurrencyValue(footerData[column.key])
                  }
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};
