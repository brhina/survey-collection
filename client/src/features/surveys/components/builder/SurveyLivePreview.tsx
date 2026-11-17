import React from 'react';
import { CreateSurveyData } from '../../../../types';
import QuestionRenderer from '../../../questions/QuestionRenderer';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';

export interface SurveyLivePreviewProps {
  survey: CreateSurveyData;
  onReturnToEdit: () => void;
}

export const SurveyLivePreview: React.FC<SurveyLivePreviewProps> = ({
  survey,
  onReturnToEdit
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6 sm:space-y-8">
      <div className="border-b border-slate-100 pb-5 text-center max-w-xl mx-auto">
        <Badge variant="emerald" className="mb-2.5">
          Preview
        </Badge>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
          {survey.title || 'Untitled Survey'}
        </h2>
        {survey.description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {survey.description}
          </p>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5 max-w-2xl mx-auto">
        {survey.questions.map((q, idx) => (
          <div key={idx} className="p-4 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {idx + 1}. {q.questionText || 'Question text...'}
              {q.isRequired && <span className="text-emerald-600 ml-1">*</span>}
            </h4>

            <div className="pt-1">
              <QuestionRenderer
                question={q}
                value=""
                onChange={() => {}}
                disabled={true}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <Button variant="secondary" size="md" onClick={onReturnToEdit}>
          Return to Builder
        </Button>
      </div>
    </div>
  );
};

export default SurveyLivePreview;
