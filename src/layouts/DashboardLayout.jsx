import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Single-Screen Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 min-w-0">
        <Outlet />
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        Project Submission &amp; Evaluation Desk &bull; Academic Portal
      </footer>
    </div>
  );
};

export default DashboardLayout;
