import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home, LayoutDashboard } from 'lucide-react';
import Button from '../../components/ui/Button';

export const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8 px-4">
      <div className="relative max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Thank You!
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Your submission has been securely recorded and synced to your email account.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Explore Collectors
            </Button>
          </Link>
          <Link to="/admin" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              leftIcon={<LayoutDashboard className="w-4 h-4 text-emerald-600" />}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
