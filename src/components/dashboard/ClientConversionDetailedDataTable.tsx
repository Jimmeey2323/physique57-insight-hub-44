
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Download, 
  Filter,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  UserCheck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionDetailedDataTableProps {
  data: NewClientData[];
  onItemClick?: (item: NewClientData) => void;
}

export const ClientConversionDetailedDataTable: React.FC<ClientConversionDetailedDataTableProps> = ({
  data,
  onItemClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('firstVisitDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(client => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        client.trainerName?.toLowerCase().includes(searchLower) ||
        client.firstVisitLocation?.toLowerCase().includes(searchLower) ||
        client.membershipUsed?.toLowerCase().includes(searchLower) ||
        client.conversionStatus?.toLowerCase().includes(searchLower) ||
        client.retentionStatus?.toLowerCase().includes(searchLower)
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof NewClientData];
      let bValue = b[sortField as keyof NewClientData];
      
      if (typeof aValue === 'string') aValue = aValue?.toLowerCase() || '';
      if (typeof bValue === 'string') bValue = bValue?.toLowerCase() || '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getConversionStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('converted')) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Converted</Badge>;
    } else if (statusLower.includes('pending')) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Not Converted</Badge>;
    }
  };

  const getRetentionStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('retained')) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Retained</Badge>;
    } else if (statusLower.includes('risk')) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">At Risk</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Not Retained</Badge>;
    }
  };

  const columns = [
    {
      key: 'firstName',
      header: 'Customer Details',
      render: (value: string, item: NewClientData) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{`${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown'}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(item.firstVisitDate)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.firstVisitLocation || 'Unknown location'}
          </div>
        </div>
      ),
      className: 'min-w-[200px]',
      sortable: true
    },
    {
      key: 'trainerName',
      header: 'Trainer',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {value ? value.split(' ').map(n => n[0]).join('').slice(0, 2) : 'UK'}
          </div>
          <span className="font-medium text-slate-800">{value || 'Unassigned'}</span>
        </div>
      ),
      className: 'min-w-[150px]',
      sortable: true
    },
    {
      key: 'membershipUsed',
      header: 'Membership',
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800">{value || 'None'}</div>
        </div>
      ),
      className: 'min-w-[120px]',
      sortable: true
    },
    {
      key: 'ltv',
      header: 'LTV',
      render: (value: number) => (
        <div className="text-center">
          <div className="font-bold text-emerald-600 text-lg">
            {formatCurrency(value || 0)}
          </div>
          <div className="text-xs text-slate-500">
            {value > 50000 ? 'High Value' : value > 20000 ? 'Medium' : 'Standard'}
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'conversionStatus',
      header: 'Conversion',
      render: (value: string) => getConversionStatusBadge(value),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'retentionStatus',
      header: 'Retention',
      render: (value: string) => getRetentionStatusBadge(value),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'visitsPostTrial',
      header: 'Activity',
      render: (value: number, item: NewClientData) => (
        <div className="text-center space-y-1">
          <div className="font-bold text-blue-600">{value || 0}</div>
          <div className="text-xs text-slate-500">visits</div>
          {item.conversionSpan && (
            <div className="text-xs text-slate-500">
              {item.conversionSpan} days span
            </div>
          )}
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value || 'Unknown'}
        </Badge>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, item: NewClientData) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onItemClick?.(item)}
          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
          View
        </Button>
      ),
      align: 'center' as const
    }
  ];

  const summaryStats = useMemo(() => {
    return {
      totalClients: filteredAndSortedData.length,
      avgLTV: filteredAndSortedData.reduce((sum, client) => sum + (client.ltv || 0), 0) / filteredAndSortedData.length,
      conversionRate: (filteredAndSortedData.filter(c => c.conversionStatus === 'Converted').length / filteredAndSortedData.length) * 100,
      retentionRate: (filteredAndSortedData.filter(c => c.retentionStatus === 'Retained').length / filteredAndSortedData.length) * 100,
      totalRevenue: filteredAndSortedData.reduce((sum, client) => sum + (client.ltv || 0), 0)
    };
  }, [filteredAndSortedData]);

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Users className="w-6 h-6" />
            Client Conversion Analysis
            <Badge className="bg-white/20 text-white border-white/30">
              {filteredAndSortedData.length} clients
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{formatNumber(summaryStats.totalClients)}</div>
            <div className="text-sm text-slate-600">Total Clients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summaryStats.avgLTV)}</div>
            <div className="text-sm text-slate-600">Avg LTV</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-slate-600">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.retentionRate.toFixed(1)}%</div>
            <div className="text-sm text-slate-600">Retention Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search clients, trainers, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Badge variant="outline" className="text-slate-600">
            <Filter className="w-3 h-3 mr-1" />
            {filteredAndSortedData.length} of {data.length} clients
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        <ModernDataTable
          data={filteredAndSortedData}
          columns={columns}
          maxHeight="600px"
          stickyHeader={true}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};
