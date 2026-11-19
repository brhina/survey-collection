import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Info, UserCheck, Sparkles } from 'lucide-react';
import { AiVerdict, HumanOverrideRecord } from '../types/aiTypes';
import AiConfidenceRadialGauge from './AiConfidenceRadialGauge';

interface AiDecisionBannerProps {
  verdict: AiVerdict;
  category: string;
  humanOverride?: HumanOverrideRecord;
  onOpenOverrideModal?: () => void;
}

export const AiDecisionBanner: React.FC<AiDecisionBannerProps> = ({
  verdict,
  category,
  humanOverride,
  onOpenOverrideModal
}) => {
  const getVerdictTheme = (statusBadge: string) => {
    switch (statusBadge) {
      case 'SUCCESS':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white',
          borderColor: 'border-emerald-200/90',
          badgeStyle: 'bg-emerald-600 text-white shadow-xs',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />,
          accentText: 'text-emerald-900',
          rationaleBorder: 'border-emerald-300'
        };
      case 'WARNING':
        return {
          cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white',
          borderColor: 'border-amber-200/90',
          badgeStyle: 'bg-amber-600 text-white shadow-xs',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          accentText: 'text-amber-900',
          rationaleBorder: 'border-amber-300'
        };
      case 'DANGER':
        return {
          cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white',
          borderColor: 'border-rose-200/90',
          badgeStyle: 'bg-rose-600 text-white shadow-xs',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          accentText: 'text-rose-900',
          rationaleBorder: 'border-rose-300'
        };
      case 'INFO':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-blue-500/10 via-blue-50/50 to-white',
          borderColor: 'border-blue-200/90',
          badgeStyle: 'bg-blue-600 text-white shadow-xs',
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          accentText: 'text-blue-900',
          rationaleBorder: 'border-blue-300'
        };
    }
  };

  const theme = getVerdictTheme(verdict.statusBadge);

  return (
    <div
      className={`rounded-3xl border ${theme.borderColor} ${theme.cardBg} p-6 sm:p-8 shadow-xs relative overflow-hidden transition-all`}
    >
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none" />

      {/* Human Override Banner if present */}
      {humanOverride && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Human-in-the-Loop Override Applied:</span>{' '}
              Original automated verdict was{' '}
              <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                {humanOverride.originalDecision}
              </code>
              . Justification: <em className="text-slate-600">"{humanOverride.overrideReason}"</em>
            </div>
          </div>
          {onOpenOverrideModal && (
            <button
              onClick={onOpenOverrideModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline self-end sm:self-auto shrink-0 cursor-pointer"
            >
              Update Override
            </button>
          )}
        </div>
      )}

      {/* Main Verdict Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-3.5 flex-1">
          {/* Category Pill & Verdict Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200 text-slate-700 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {category} Operational Decision
            </span>

            <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black tracking-wide ${theme.badgeStyle}`}>
              {verdict.decision}
            </span>
          </div>

          {/* Verdict Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-start gap-2.5">
            {theme.icon}
            <span>{verdict.verdictHeadline}</span>
          </h2>

          {/* Core Justification Callout */}
          <div className={`p-4 rounded-2xl bg-white/80 border-l-4 ${theme.rationaleBorder} border-slate-200/60 shadow-2xs space-y-1`}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Automated Reasoning & Rationale
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {verdict.coreJustification}
            </p>
          </div>
        </div>

        {/* Right Side: Confidence Gauge Card */}
        <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs shrink-0 lg:min-w-[170px]">
          <AiConfidenceRadialGauge score={verdict.confidenceScore} size={84} strokeWidth={8} />

          <div className="text-right lg:text-center space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Confidence Score
            </span>
            <span className="text-[11px] text-slate-500 block">
              Bayesian Consensus
            </span>
            {onOpenOverrideModal && !humanOverride && (
              <button
                onClick={onOpenOverrideModal}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline block pt-1 cursor-pointer"
              >
                Override Verdict
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDecisionBanner;
