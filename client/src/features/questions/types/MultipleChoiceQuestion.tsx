import React from 'react';
import { QuestionProps } from './TextQuestion';

export const MultipleChoiceQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  const qId = question._id || 'mcq';

  return (
    <div className="space-y-2 sm:space-y-2.5">
      {question.options?.map((opt, oIndex) => {
        const isSelected = value === opt;
        return (
          <label
            key={oIndex}
            className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all select-none ${
              disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
            } ${
              isSelected
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-medium shadow-2xs'
                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
            }`}
          >
            <input
              type="radio"
              disabled={disabled}
              name={`mcq_${qId}`}
              value={opt}
              checked={isSelected}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-sm sm:text-base leading-normal">{opt}</span>
          </label>
        );
      })}
    </div>
  );
};

export default MultipleChoiceQuestion;
