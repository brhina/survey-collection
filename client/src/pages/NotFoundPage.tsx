import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The requested page does not exist or has been moved.
      </p>
      <Link to="/" className="w-full sm:w-auto">
        <Button variant="primary" size="md" className="w-full sm:w-auto" leftIcon={<HomeIcon className="w-4 h-4" />}>
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
