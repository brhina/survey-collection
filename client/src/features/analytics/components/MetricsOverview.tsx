import React from 'react';
import { Survey, SurveyResultsData } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import Badge from '../../../components/ui/Badge';

export interface MetricsOverviewProps {
  survey: Survey;
  results: SurveyResultsData;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ survey, results }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div className="max-w-xl">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="emerald">Active</Badge>
          {survey.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {survey.category}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(survey.createdAt)}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          {survey.title}
        </h2>
        {survey.description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {survey.description}
          </p>
        )}
      </div>

      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 sm:p-5 text-center sm:min-w-[170px] shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
          Submissions
        </span>
        <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-0.5">
          {results.totalResponses}
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
