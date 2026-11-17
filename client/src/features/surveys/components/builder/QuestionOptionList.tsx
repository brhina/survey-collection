import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface QuestionOptionListProps {
  options: string[];
  onAddOption: () => void;
  onUpdateOption: (index: number, val: string) => void;
  onRemoveOption: (index: number) => void;
}

export const QuestionOptionList: React.FC<QuestionOptionListProps> = ({
  options,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}) => {
  return (
    <div className="space-y-2 pt-1">
      {options.map((opt, oIndex) => (
        <div key={oIndex} className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[11px] font-semibold text-slate-500 shrink-0">
            {oIndex + 1}
          </span>
          <input
            type="text"
            value={opt}
            onChange={(e) => onUpdateOption(oIndex, e.target.value)}
            placeholder={`Option ${oIndex + 1}`}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
            required
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => onRemoveOption(oIndex)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
              aria-label={`Remove option ${oIndex + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddOption}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 py-1.5 px-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Add Option</span>
      </button>
    </div>
  );
};

export default QuestionOptionList;
