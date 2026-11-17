import React from 'react';
import { Check } from 'lucide-react';
import { QuestionProps } from './TextQuestion';

export const CheckboxQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  const selectedList = Array.isArray(value) ? (value as string[]) : [];

  const handleToggle = (opt: string) => {
    if (disabled) return;
    const updated = selectedList.includes(opt)
      ? selectedList.filter((item) => item !== opt)
      : [...selectedList, opt];
    onChange(updated);
  };

  return (
    <div className="space-y-2 sm:space-y-2.5">
      {question.options?.map((opt, oIndex) => {
        const isChecked = selectedList.includes(opt);
        return (
          <label
            key={oIndex}
            className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all select-none ${
              disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
            } ${
              isChecked
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-medium shadow-2xs'
                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
            }`}
          >
            <input
              type="checkbox"
              disabled={disabled}
              value={opt}
              checked={isChecked}
              onChange={() => handleToggle(opt)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                isChecked
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className="text-sm sm:text-base leading-normal">{opt}</span>
          </label>
        );
      })}
    </div>
  );
};

export default CheckboxQuestion;
