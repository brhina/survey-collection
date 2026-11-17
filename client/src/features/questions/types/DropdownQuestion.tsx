import React from 'react';
import { QuestionProps } from './TextQuestion';

export const DropdownQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <select
      disabled={disabled}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
    >
      <option value="">Select an option...</option>
      {question.options?.map((opt, oIdx) => (
        <option key={oIdx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

export default DropdownQuestion;
