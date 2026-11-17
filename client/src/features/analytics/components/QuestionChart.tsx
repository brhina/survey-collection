import React from 'react';
import { Star } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { QuestionAnalysis } from '../../../types';

export interface QuestionChartProps {
  analysis: QuestionAnalysis;
}

const CHART_COLORS = [
  '#059669', // emerald-600
  '#10b981', // emerald-500
  '#34d399', // emerald-400
  '#0f766e', // teal-700
  '#14b8a6', // teal-500
  '#0d9488', // teal-600
  '#047857', // emerald-700
  '#6ee7b7'  // emerald-300
];

export const QuestionChart: React.FC<QuestionChartProps> = ({ analysis }) => {
  if (!analysis) return null;

  switch (analysis.type) {
    case 'multiple-choice':
    case 'dropdown': {
      const data = Object.entries(analysis.optionCounts || {}).map(([label, value]) => ({
        label,
        value
      }));

      const totalValue = data.reduce((sum, item) => sum + item.value, 0);

      if (data.length === 0 || data.every((d) => d.value === 0)) {
        return (
          <div className="py-6 text-center text-xs text-slate-400">
            No responses recorded yet
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="h-52 sm:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} (${totalValue > 0 ? Math.round((val / totalValue) * 100) : 0}%)`, 'Responses']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#f1f5f9',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Legend Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {data.map((item, idx) => {
              const pct = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate font-medium">{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {item.value} <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'checkbox': {
      const data = Object.entries(analysis.optionCounts || {}).map(([label, value]) => ({
        label,
        count: value
      }));

      if (data.length === 0 || data.every((d) => d.count === 0)) {
        return (
          <div className="py-6 text-center text-xs text-slate-400">
            No responses recorded yet
          </div>
        );
      }

      return (
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  borderColor: '#f1f5f9',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case 'rating': {
      const avg = analysis.averageRating || 0;
      return (
        <div className="py-4 sm:py-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  star <= Math.round(avg)
                    ? 'fill-emerald-500 text-emerald-500'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {avg.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-0.5">
            Average (out of 5)
          </span>
        </div>
      );
    }

    case 'text':
    case 'long-text': {
      const responses = analysis.responses || [];
      return (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {responses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No responses recorded yet</p>
          ) : (
            responses.map((resp, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed"
              >
                {String(resp)}
              </div>
            ))
          )}
        </div>
      );
    }

    default:
      return null;
  }
};

export default QuestionChart;
