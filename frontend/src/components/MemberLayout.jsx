import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberTopbar from './MemberTopbar';
import CompanyBar from './CompanyBar';

const MemberLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CompanyBar />
      <div className="flex flex-1 min-h-0">
        <MemberSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <MemberTopbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/10 via-background to-background pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10 w-full h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MemberLayout;