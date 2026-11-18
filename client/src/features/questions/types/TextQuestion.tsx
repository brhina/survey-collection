import React from 'react';
import { Question } from '../../../types';

export interface QuestionProps {
  question: Question;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
}

export const TextQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  if (question.type === 'long-text') {
    return (
      <textarea
        disabled={disabled}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Type your response here..."
        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white resize-none disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
      />
    );
  }

  if (question.type === 'number') {
    return (
      <input
        type="number"
        disabled={disabled}
        value={value !== undefined && value !== null ? String(value) : ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder="Enter number..."
        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
      />
    );
  }

  if (question.type === 'email') {
    return (
      <input
        type="email"
        disabled={disabled}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="name@example.com"
        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
      />
    );
  }

  if (question.type === 'phone') {
    return (
      <input
        type="tel"
        disabled={disabled}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Phone number..."
        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
      />
    );
  }

  if (question.type === 'date') {
    return (
      <input
        type="date"
        disabled={disabled}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
      />
    );
  }

  return (
    <input
      type="text"
      disabled={disabled}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer..."
      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 shadow-2xs"
    />
  );
};

export default TextQuestion;
