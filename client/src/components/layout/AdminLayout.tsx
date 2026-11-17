import React from 'react';
import Navbar from './Navbar';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200/60 bg-white/60 py-5 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} SurveyFlow</p>
      </footer>
    </div>
  );
};

export default AdminLayout;
