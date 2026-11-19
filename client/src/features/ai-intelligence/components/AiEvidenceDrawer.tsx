import React from 'react';
import { Quote, CheckCircle2 } from 'lucide-react';
import { AiCitation } from '../types/aiTypes';

interface AiEvidenceDrawerProps {
  citations: AiCitation[];
}

export const AiEvidenceDrawer: React.FC<AiEvidenceDrawerProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
          <Quote className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Evidence Citations & Verified Quotes
          </h3>
          <p className="text-[11px] text-slate-400">
            Real respondent data points directly grounding the operational decision
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {citations.map((cite, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                {cite.questionText}
              </span>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/70 self-start sm:self-auto shrink-0">
                {cite.metricValue}
              </span>
            </div>

            {cite.sampleQuotes && cite.sampleQuotes.length > 0 && (
              <div className="space-y-2 pt-1">
                {cite.sampleQuotes.map((quote, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-2.5 px-3 rounded-xl bg-white border border-slate-200/60 text-xs text-slate-700 italic shadow-2xs leading-relaxed"
                  >
                    "{quote}"
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiEvidenceDrawer;
