import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/10 via-background to-background pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
