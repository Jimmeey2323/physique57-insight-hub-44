
import React from 'react';
import { SessionsSection } from '@/components/dashboard/SessionsSection';
import { Footer } from '@/components/ui/footer';

const Sessions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <SessionsSection />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Sessions;
