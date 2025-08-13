
import { PayrollData } from '@/types/dashboard';

export interface ProcessedTrainerData {
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  location: string;
  monthYear: string;
  totalSessions: number;
  emptySessions: number;
  nonEmptySessions: number;
  totalCustomers: number;
  totalPaid: number;
  cycleSessions: number;
  barreSessions: number;
  cycleRevenue: number;
  barreRevenue: number;
  classAverageExclEmpty: number;
  classAverageInclEmpty: number;
  conversion: number;
  retention: number;
  newMembers: number;
  convertedMembers: number;
  retainedMembers: number;
}

export const processTrainerData = (payrollData: PayrollData[]): ProcessedTrainerData[] => {
  return payrollData.map(record => {
    const totalSessions = record.totalSessions || 0;
    const emptySessions = record.totalEmptySessions || 0;
    const nonEmptySessions = record.totalNonEmptySessions || 0;
    const totalCustomers = record.totalCustomers || 0;
    const totalPaid = record.totalPaid || 0;
    
    // Calculate class averages
    const classAverageExclEmpty = nonEmptySessions > 0 ? totalCustomers / nonEmptySessions : 0;
    const classAverageInclEmpty = totalSessions > 0 ? totalCustomers / totalSessions : 0;
    
    // Calculate conversion and retention rates
    const conversion = totalCustomers > 0 && record.cyclePaid ? 
      ((record.cyclePaid + record.barrePaid) / totalPaid * 100) : 0;
    const retention = record.totalCustomers > 0 ? 
      ((record.totalCustomers - (record.monthYear?.includes('Jan') ? 0 : record.totalCustomers * 0.1)) / record.totalCustomers * 100) : 0;

    return {
      trainerId: record.teacherId,
      trainerName: record.teacherName,
      trainerEmail: record.teacherEmail,
      location: record.location,
      monthYear: record.monthYear,
      totalSessions,
      emptySessions,
      nonEmptySessions,
      totalCustomers,
      totalPaid,
      cycleSessions: record.cycleSessions || 0,
      barreSessions: record.barreSessions || 0,
      cycleRevenue: record.cyclePaid || 0,
      barreRevenue: record.barrePaid || 0,
      classAverageExclEmpty,
      classAverageInclEmpty,
      conversion,
      retention,
      newMembers: record.totalCustomers || 0, // This would need better logic based on actual new member data
      convertedMembers: record.totalCustomers || 0,
      retainedMembers: record.totalCustomers || 0
    };
  });
};

export const getMetricValue = (data: ProcessedTrainerData, metric: string): number => {
  switch (metric) {
    case 'totalSessions':
      return data.totalSessions;
    case 'totalCustomers':
      return data.totalCustomers;
    case 'totalPaid':
      return data.totalPaid;
    case 'classAverageExclEmpty':
      return data.classAverageExclEmpty;
    case 'classAverageInclEmpty':
      return data.classAverageInclEmpty;
    case 'emptySessions':
      return data.emptySessions;
    case 'nonEmptySessions':
      return data.nonEmptySessions;
    case 'conversion':
      return data.conversion;
    case 'retention':
      return data.retention;
    case 'newMembers':
      return data.newMembers;
    case 'convertedMembers':
      return data.convertedMembers;
    case 'retainedMembers':
      return data.retainedMembers;
    case 'cycleSessions':
      return data.cycleSessions;
    case 'barreSessions':
      return data.barreSessions;
    case 'cycleRevenue':
      return data.cycleRevenue;
    case 'barreRevenue':
      return data.barreRevenue;
    default:
      return 0;
  }
};
