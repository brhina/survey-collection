import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RotateCcw, Sparkles, Columns, LayoutList, CheckCircle2 } from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { responseApi } from '../../features/responses/api/responseApi';
import { Survey } from '../../types';
import useDraftAutoSave from '../../features/responses/hooks/useDraftAutoSave';
import SurveyWizard from '../../features/responses/components/SurveyWizard';
import QuestionRenderer from '../../features/questions/QuestionRenderer';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';

export const TakeSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'wizard' | 'scroll'>('wizard');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { answers, setAnswer, clearDraft, draftRestored } = useDraftAutoSave(id);

  useEffect(() => {
    if (id) {
      loadSurvey(id);
    }
  }, [id]);

  const loadSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      const data = await surveyApi.getById(surveyId);
      setSurvey(data);
    } catch (err) {
      console.error('Failed to load survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!survey) return false;
    const q = survey.questions[currentIndex];
    const qId = q._id || `q_${currentIndex}`;
    const ans = answers[qId];

    if (q.isRequired) {
      const isEmpty =
        ans === undefined ||
        ans === null ||
        ans === '' ||
        (Array.isArray(ans) && ans.length === 0);

      if (isEmpty) {
        toast.error('Please answer this required question');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (survey && currentIndex < survey.questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!survey || !id) return;

    for (let i = 0; i < survey.questions.length; i++) {
      const q = survey.questions[i];
      const qId = q._id || `q_${i}`;
      const ans = answers[qId];
      if (q.isRequired) {
        const isEmpty =
          ans === undefined ||
          ans === null ||
          ans === '' ||
          (Array.isArray(ans) && ans.length === 0);

        if (isEmpty) {
          toast.error(`Please answer Question ${i + 1}`);
          if (viewMode === 'wizard') {
            setCurrentIndex(i);
          }
          return;
        }
      }
    }

    const formattedAnswers = survey.questions.map((q, idx) => {
      const qKey = q._id ? q._id.toString() : `q_${idx}`;
      let val = answers[qKey];
      if (val === undefined || val === null) {
        val = q.type === 'checkbox' ? [] : '';
      }
      return {
        questionId: q._id ? q._id.toString() : `q_${idx}`,
        answer: val
      };
    });

    try {
      setSubmitting(true);
      await responseApi.submit({
        surveyId: id,
        answers: formattedAnswers
      });

      clearDraft();
      toast.success('Response submitted successfully');
      navigate('/thank-you');
    } catch (err) {
      console.error('Failed to submit survey:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading survey...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Survey Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm">
          This survey does not exist or has been closed.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  const totalQuestions = survey.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-4 space-y-5 sm:space-y-6">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {draftRestored && (
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[11px] font-medium">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Draft restored</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(answers).length > 0 && (
            <button
              onClick={clearDraft}
              className="text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer text-xs"
              title="Reset answers"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('wizard')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'wizard' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400'
              }`}
              title="Step-by-step view"
              aria-label="Step-by-step view"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'scroll' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400'
              }`}
              title="All-in-one view"
              aria-label="All-in-one view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'wizard' && (
        <ProgressBar progress={progressPercent} showLabel={true} />
      )}

      {/* Survey Header */}
      <div className="text-center space-y-1.5 pb-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {survey.title}
        </h1>
        {survey.description && (
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {survey.description}
          </p>
        )}
      </div>

      {viewMode === 'wizard' ? (
        <SurveyWizard
          survey={survey}
          currentIndex={currentIndex}
          answers={answers}
          submitting={submitting}
          onAnswerChange={setAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {survey.questions.map((q, idx) => {
            const qId = q._id || `q_${idx}`;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {q.questionText}
                    {q.isRequired && <span className="text-emerald-600 ml-1">*</span>}
                  </h3>
                </div>

                <div>
                  <QuestionRenderer
                    question={q}
                    value={answers[qId]}
                    onChange={(val) => setAnswer(qId, val)}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="md"
              isLoading={submitting}
              onClick={handleSubmit}
              className="w-full sm:w-auto"
              leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[2.2]" />}
            >
              Submit Survey
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeSurveyPage;
