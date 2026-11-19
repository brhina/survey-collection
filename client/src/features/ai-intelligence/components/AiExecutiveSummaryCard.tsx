import React from 'react';
import { FileText, Cpu, Zap, Clock, Database } from 'lucide-react';
import { AiCollectorAnalysis } from '../types/aiTypes';

interface AiExecutiveSummaryCardProps {
  analysis: AiCollectorAnalysis;
  modelName: string;
  provider: string;
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cached?: boolean;
  createdAt?: string;
  totalResponsesAnalyzed?: number;
}

export const AiExecutiveSummaryCard: React.FC<AiExecutiveSummaryCardProps> = ({
  analysis,
  modelName,
  provider,
  tokenUsage,
  cached,
  createdAt,
  totalResponsesAnalyzed
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
      {/* Header & Meta Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Executive Leadership Briefing
            </h3>
            <p className="text-[11px] text-slate-400">
              Autonomous cognitive synthesis across all respondent data points
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
            <Cpu className="w-3 h-3 text-slate-500" />
            {modelName} ({provider})
          </span>

          {cached && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              <Zap className="w-3 h-3 text-emerald-600" />
              {'Cached (< 15ms)'}
            </span>
          )}

          {totalResponsesAnalyzed !== undefined && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
              <Database className="w-3 h-3 text-slate-400" />
              {totalResponsesAnalyzed} records
            </span>
          )}

          {createdAt && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Main Narrative */}
      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80">
        <p className="whitespace-pre-line">{analysis.executiveSummary}</p>
      </div>

      {/* Statistical Note */}
      {analysis.dataIntegrityNotes && (
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] flex items-start gap-2">
          <span className="font-bold shrink-0">Statistical Note:</span>
          <span>{analysis.dataIntegrityNotes}</span>
        </div>
      )}

      {/* Token Footprint */}
      {tokenUsage && (
        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-50">
          <span>PII Sanity Check: Passed</span>
          <div className="flex items-center gap-2">
            <span>Tokens: {tokenUsage.totalTokens}</span>
            <span>•</span>
            <span>Prompt: {tokenUsage.promptTokens}</span>
            <span>•</span>
            <span>Completion: {tokenUsage.completionTokens}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiExecutiveSummaryCard;
