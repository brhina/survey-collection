import React from 'react';
import { Layers, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { AiTheme, SentimentType } from '../types/aiTypes';

interface AiThemeClusterGridProps {
  themes: AiTheme[];
}

export const AiThemeClusterGrid: React.FC<AiThemeClusterGridProps> = ({ themes }) => {
  if (!themes || themes.length === 0) return null;

  const getSentimentBadge = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'VERY_POSITIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          bar: 'bg-emerald-500',
          icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Very Positive'
        };
      case 'POSITIVE':
        return {
          bg: 'bg-emerald-50/80 text-emerald-700 border-emerald-200',
          bar: 'bg-emerald-400',
          icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />,
          label: 'Positive'
        };
      case 'NEGATIVE':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          bar: 'bg-rose-400',
          icon: <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />,
          label: 'Negative'
        };
      case 'VERY_NEGATIVE':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
          bar: 'bg-rose-600',
          icon: <ThumbsDown className="w-3.5 h-3.5 text-rose-700" />,
          label: 'Very Negative'
        };
      case 'NEUTRAL':
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          bar: 'bg-slate-400',
          icon: <Minus className="w-3.5 h-3.5 text-slate-500" />,
          label: 'Neutral'
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Key Semantic Themes & Sentiment
          </h3>
          <p className="text-[11px] text-slate-400">
            Categorized opinion patterns extracted from qualitative responses
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {themes.map((theme, idx) => {
          const badge = getSentimentBadge(theme.sentiment);
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {theme.percentageAffected}% of respondents
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 pt-0.5">{theme.theme}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{theme.summary}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${badge.bar}`}
                  style={{ width: `${Math.min(100, Math.max(8, theme.percentageAffected))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AiThemeClusterGrid;
