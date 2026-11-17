import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Survey } from '../../../types';
import QuestionRenderer from '../../questions/QuestionRenderer';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export interface SurveyWizardProps {
  survey: Survey;
  currentIndex: number;
  answers: Record<string, unknown>;
  submitting: boolean;
  onAnswerChange: (questionId: string, val: unknown) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  survey,
  currentIndex,
  answers,
  submitting,
  onAnswerChange,
  onPrevious,
  onNext,
  onSubmit
}) => {
  const currentQ = survey.questions[currentIndex];
  const qId = currentQ._id || `q_${currentIndex}`;
  const total = survey.questions.length;
  const isLast = currentIndex === total - 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-5 sm:space-y-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Question {currentIndex + 1} of {total}
            </span>
            {currentQ.isRequired && <Badge variant="emerald">Required</Badge>}
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        <div className="pt-1">
          <QuestionRenderer
            question={currentQ}
            value={answers[qId]}
            onChange={(val) => onAnswerChange(qId, val)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            disabled={currentIndex === 0}
            onClick={onPrevious}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {isLast ? (
            <Button
              variant="primary"
              size="md"
              isLoading={submitting}
              onClick={onSubmit}
              leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[2.2]" />}
            >
              Submit Survey
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.2]" />}
            >
              Next
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SurveyWizard;
