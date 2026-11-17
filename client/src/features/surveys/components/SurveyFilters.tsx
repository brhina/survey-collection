import React from 'react';
import { Search, X } from 'lucide-react';

export interface SurveyFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export const SurveyFilters: React.FC<SurveyFiltersProps> = ({
  search,
  onSearchChange
}) => {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder="Search surveys..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SurveyFilters;
