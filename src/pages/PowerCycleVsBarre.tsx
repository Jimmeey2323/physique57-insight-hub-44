
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { SessionData } from '@/types/dashboard';

const PowerCycleVsBarre = () => {
  const { data: rawSessionData, loading } = useSessionsData();
  const { isLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(loading, 'Loading PowerCycle vs Barre performance data...');
  }, [loading, setLoading]);

  // Transform raw session data to match SessionData interface
  const sessionData: SessionData[] = rawSessionData.map((session: any) => ({
    sessionId: session.sessionId || '',
    date: session.date || '',
    time: session.time || '',
    classType: session.classType || '',
    cleanedClass: session.cleanedClass || '',
    instructor: session.trainerName || '',
    location: session.location || '',
    capacity: session.capacity || 0,
    booked: session.bookedCount || 0,
    checkedIn: session.checkedInCount || 0,
    checkedInCount: session.checkedInCount || 0,
    waitlisted: session.waitlisted || 0,
    waitlist: session.waitlisted || 0,
    noShows: (session.bookedCount || 0) - (session.checkedInCount || 0),
    fillPercentage: session.fillPercentage || 0,
    sessionCount: session.sessionCount || 0,
    totalAttendees: session.checkedInCount || 0,
  }));

  // Calculate metrics
  const totalSessions = sessionData.length;
  const totalBookings = sessionData.reduce((sum, session) => sum + session.booked, 0);
  const totalCheckedIn = sessionData.reduce((sum, session) => sum + session.checkedInCount, 0);
  const totalWaitlisted = sessionData.reduce((sum, session) => sum + session.waitlist, 0);
  const avgFillRate = sessionData.length > 0 
    ? sessionData.reduce((sum, session) => sum + session.fillPercentage, 0) / sessionData.length 
    : 0;
  const totalNoShows = sessionData.reduce((sum, session) => sum + session.noShows, 0);

  if (isLoading) {
    return <RefinedLoader subtitle="Loading PowerCycle vs Barre performance data..." />;
  }

  return (
    <SectionLayout
      title="PowerCycle vs Barre Analysis"
    >
      <div>
        {/* Your component content here */}
        <p>Total Sessions: {totalSessions}</p>
        <p>Total Bookings: {totalBookings}</p>
        <p>Total Checked In: {totalCheckedIn}</p>
        <p>Total Waitlisted: {totalWaitlisted}</p>
        <p>Average Fill Rate: {avgFillRate.toFixed(2)}%</p>
        <p>Total No Shows: {totalNoShows}</p>
      </div>
    </SectionLayout>
  );
};

export default PowerCycleVsBarre;
