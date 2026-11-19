import React from 'react';
import { Sparkles, Loader2, ShieldCheck, Cpu } from 'lucide-react';
import { StreamPhaseEvent } from '../types/aiTypes';

interface AiStreamingThinkingStateProps {
  streamPhase: StreamPhaseEvent | null;
}

export const AiStreamingThinkingState: React.FC<AiStreamingThinkingStateProps> = ({ streamPhase }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-200/80 p-6 sm:p-10 shadow-xs text-center space-y-5">
      <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
        <div className="relative w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-6 h-6 animate-spin text-white" />
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Synthesizing Autonomous Decision & Intelligence
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {streamPhase?.message || 'Streaming cognitive synthesis through multi-dimensional rubrics...'}
        </p>
      </div>

      <div className="max-w-sm mx-auto flex items-center justify-center gap-3 pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {streamPhase?.phase || 'PROCESSING'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          PII Sanitized
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          Structured Schema
        </span>
      </div>
    </div>
  );
};

export default AiStreamingThinkingState;
