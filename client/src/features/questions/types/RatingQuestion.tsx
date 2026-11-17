import React from 'react';
import { QuestionProps } from './TextQuestion';

export const RatingQuestion: React.FC<QuestionProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="py-2">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((score) => {
          const isSelected = value === String(score) || value === score;
          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              onClick={() => onChange(String(score))}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between max-w-xs mx-auto text-[11px] text-slate-400 font-medium pt-3 px-2">
        <span>1 (Low)</span>
        <span>5 (High)</span>
      </div>
    </div>
  );
};

export default RatingQuestion;
