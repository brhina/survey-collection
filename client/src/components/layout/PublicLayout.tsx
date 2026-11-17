import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-md py-3.5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            SurveyFlow
          </span>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      <footer className="py-5 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>© {new Date().getFullYear()} SurveyFlow</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
