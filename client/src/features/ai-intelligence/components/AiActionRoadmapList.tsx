import React from 'react';
import { Target, User, Clock, CheckSquare } from 'lucide-react';
import { AiRoadmapItem, RoadmapPriority } from '../types/aiTypes';

interface AiActionRoadmapListProps {
  roadmap: AiRoadmapItem[];
}

export const AiActionRoadmapList: React.FC<AiActionRoadmapListProps> = ({ roadmap }) => {
  if (!roadmap || roadmap.length === 0) return null;

  const getPriorityBadge = (priority: RoadmapPriority) => {
    switch (priority) {
      case 'P0_IMMEDIATE':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
      case 'P1_HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'P2_MEDIUM':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
      case 'P3_LOW':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
      {/* Title & Task Count */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Prioritized Actionable Roadmap
            </h3>
            <p className="text-[11px] text-slate-400">
              Ordered operational execution steps with assigned leads
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
          {roadmap.length} {roadmap.length === 1 ? 'Action' : 'Actions'}
        </span>
      </div>

      {/* Responsive Card-Based Task List */}
      <div className="space-y-3">
        {roadmap.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col gap-3"
          >
            {/* Top Row: Priority Badge + Timeframe Chip */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{idx + 1}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase border tracking-wider shadow-2xs ${getPriorityBadge(
                    item.priority
                  )}`}
                >
                  {item.priority.replace('_', ' ')}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-bold text-[11px] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item.timeframe}</span>
              </span>
            </div>

            {/* Middle Row: Action Task Item (Full Width, never squished!) */}
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug flex items-start gap-2.5 pt-0.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="flex-1 break-words">{item.actionItem}</span>
            </div>

            {/* Bottom Row: Assigned Lead Owner */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Assigned Role:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 text-[11px] shadow-2xs truncate max-w-[220px]">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{item.suggestedOwnerRole}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiActionRoadmapList;
