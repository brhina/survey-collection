import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { RawResponseRecord, Survey } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';

export interface ResponseTableProps {
  survey: Survey;
  responses: RawResponseRecord[];
}

export const ResponseTable: React.FC<ResponseTableProps> = ({ survey, responses }) => {
  const [filterQuery, setFilterQuery] = useState<string>('');

  if (responses.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-sm text-slate-400 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        No submissions recorded yet for this data collector.
      </div>
    );
  }

  const filteredResponses = responses.filter((record) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const emailMatch = (record.respondentEmail || record.respondentId?.email || '').toLowerCase().includes(q);
    const nameMatch = (record.respondentId?.name || '').toLowerCase().includes(q);
    const answerMatch = record.answers.some((a) => String(a.answer).toLowerCase().includes(q));
    return emailMatch || nameMatch || answerMatch;
  });

  return (
    <div className="space-y-3">
      {/* Search / Filter submissions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by respondent email or answer..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{filteredResponses.length}</span> of {responses.length} unique submissions
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredResponses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No submissions match "{filterQuery}".
          </div>
        ) : (
          filteredResponses.map((record, rIdx) => {
            const email = record.respondentEmail || record.respondentId?.email || 'Anonymous';
            const name = record.respondentId?.name;

            return (
              <div key={record._id || rIdx} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-400">
                      #{responses.length - rIdx}
                    </span>
                    <span className="font-mono font-medium text-slate-900">
                      {email}
                    </span>
                    {name && <span className="text-slate-500 font-sans">({name})</span>}
                  </div>

                  <span className="text-slate-400 text-[11px] sm:text-xs">
                    {formatDateTime(record.submittedAt)}
                  </span>
                </div>

                <div className="space-y-2 bg-slate-50/60 rounded-xl p-3 sm:p-4 border border-slate-100">
                  {survey.questions.map((q, qIdx) => {
                    const answerObj = record.answers.find(
                      (a) => a.questionId.toString() === (q._id ? q._id.toString() : '')
                    );
                    const ansVal = answerObj ? answerObj.answer : '—';
                    return (
                      <div key={qIdx} className="text-xs sm:text-sm">
                        <span className="text-slate-500 font-medium">{q.questionText}: </span>
                        <span className="text-slate-900 font-semibold">
                          {Array.isArray(ansVal) ? ansVal.join(', ') : String(ansVal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResponseTable;
