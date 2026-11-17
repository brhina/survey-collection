import React from 'react';
import { ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import { Question, QuestionType } from '../../../../types';
import QuestionOptionList from './QuestionOptionList';

export interface QuestionBuilderProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onUpdate: (field: keyof Question, value: unknown) => void;
  onTypeChange: (type: QuestionType) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, val: string) => void;
  onRemoveOption: (optionIndex: number) => void;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  index,
  totalQuestions,
  onUpdate,
  onTypeChange,
  onMove,
  onDuplicate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
            Q{index + 1}
          </span>

          <select
            value={question.type}
            onChange={(e) => onTypeChange(e.target.value as QuestionType)}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="checkbox">Checkboxes</option>
            <option value="rating">Rating Scale</option>
            <option value="text">Short Answer</option>
            <option value="long-text">Paragraph</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove('up')}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Move up"
            aria-label="Move question up"
          >
            <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            disabled={index === totalQuestions - 1}
            onClick={() => onMove('down')}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Move down"
            aria-label="Move question down"
          >
            <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Duplicate"
            aria-label="Duplicate question"
          >
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Delete question"
            aria-label="Delete question"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Question Input */}
      <div>
        <input
          type="text"
          placeholder="Enter question..."
          value={question.questionText}
          onChange={(e) => onUpdate('questionText', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
          required
        />
      </div>

      {/* Options if applicable */}
      {['multiple-choice', 'checkbox', 'dropdown'].includes(question.type) && (
        <QuestionOptionList
          options={question.options || []}
          onAddOption={onAddOption}
          onUpdateOption={onUpdateOption}
          onRemoveOption={onRemoveOption}
        />
      )}

      {/* Rating Preview */}
      {question.type === 'rating' && (
        <div className="flex items-center gap-2 py-1 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((val) => (
            <div
              key={val}
              className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0"
            >
              {val}
            </div>
          ))}
        </div>
      )}

      {/* Bottom controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={question.isRequired}
            onChange={(e) => onUpdate('isRequired', e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <span className="text-slate-700 font-medium">Required</span>
        </label>
      </div>
    </div>
  );
};

export default QuestionBuilder;
