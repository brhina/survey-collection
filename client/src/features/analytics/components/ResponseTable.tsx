import React from 'react';
import { RawResponseRecord, Survey } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';

export interface ResponseTableProps {
  survey: Survey;
  responses: RawResponseRecord[];
}

export const ResponseTable: React.FC<ResponseTableProps> = ({ survey, responses }) => {
  if (responses.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-sm text-slate-400 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        No submissions recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
      {responses.map((record, rIdx) => (
        <div key={record._id || rIdx} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold text-slate-800">
              Submission #{responses.length - rIdx}
            </span>
            <span>{formatDateTime(record.submittedAt)}</span>
          </div>

          <div className="space-y-2 bg-slate-50/60 rounded-xl p-3 sm:p-4 border border-slate-100">
            {survey.questions.map((q, qIdx) => {
              const answerObj = record.answers.find(
                (a) => a.questionId.toString() === (q._id ? q._id.toString() : '')
              );
              const ansVal = answerObj ? answerObj.answer : '—';
              return (
                <div key={qIdx} className="text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">{q.questionText}: </span>
                  <span className="text-slate-900 font-semibold">
                    {Array.isArray(ansVal) ? ansVal.join(', ') : String(ansVal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResponseTable;
