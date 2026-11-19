import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { AiRiskFactor, RiskSeverity } from '../types/aiTypes';

interface AiRiskMatrixTableProps {
  risks: AiRiskFactor[];
}

export const AiRiskMatrixTable: React.FC<AiRiskMatrixTableProps> = ({ risks }) => {
  if (!risks || risks.length === 0) return null;

  const getSeverityStyle = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Operational Risk Matrix & Safeguards
          </h3>
          <p className="text-[11px] text-slate-400">
            Detected failure points and mandatory mitigation directives
          </p>
        </div>
      </div>

      {/* Card List Format for cleaner responsive reading */}
      <div className="space-y-3">
        {risks.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] uppercase tracking-wider ${getSeverityStyle(
                  item.severity
                )}`}
              >
                {item.severity === 'CRITICAL' && <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />}
                {item.severity === 'HIGH' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                {item.severity} Risk
              </span>

              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Likelihood: {item.likelihood.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-900">
              {item.risk}
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2 shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Recommended Safeguard: </span>
                {item.mitigation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiRiskMatrixTable;
