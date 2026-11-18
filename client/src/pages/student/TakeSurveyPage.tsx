import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RotateCcw,
  Sparkles,
  Columns,
  LayoutList,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { responseApi } from '../../features/responses/api/responseApi';
import { Survey } from '../../types';
import { useAuth } from '../../features/auth/context/AuthContext';
import useDraftAutoSave from '../../features/responses/hooks/useDraftAutoSave';
import SurveyWizard from '../../features/responses/components/SurveyWizard';
import QuestionRenderer from '../../features/questions/QuestionRenderer';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export const TakeSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'wizard' | 'scroll'>('wizard');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Respondent Email state & eligibility check
  const [respondentEmail, setRespondentEmail] = useState<string>(() => {
    return user?.email || localStorage.getItem('last_collector_email') || '';
  });
  const [eligibility, setEligibility] = useState<{
    checked: boolean;
    isEligible: boolean | null;
    message: string | null;
  }>({
    checked: false,
    isEligible: null,
    message: null
  });

  // Duplicate conflict modal state
  const [conflictModalOpen, setConflictModalOpen] = useState<boolean>(false);
  const [conflictMessage, setConflictMessage] = useState<string>('');

  const { answers, setAnswer, clearDraft, draftRestored } = useDraftAutoSave(id);

  // Sync user email when auth state changes
  useEffect(() => {
    if (user?.email) {
      setRespondentEmail(user.email);
    }
  }, [user]);

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
      console.error('Failed to load collector:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailEligibility = async (emailToCheck: string) => {
    if (!id || !emailToCheck.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck.trim())) return;

    try {
      const res = await responseApi.checkEligibility(id, emailToCheck.trim());
      setEligibility({
        checked: true,
        isEligible: res.eligible,
        message: res.message
      });
      if (!res.eligible) {
        toast.error('This email has already submitted a response for this collector.', { id: 'dup-warn' });
      }
    } catch {
      // Ignore background check network error
    }
  };

  const handleEmailChange = (val: string) => {
    setRespondentEmail(val);
    localStorage.setItem('last_collector_email', val);
    setEligibility({ checked: false, isEligible: null, message: null });
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
        toast.error(`Please answer required question: "${q.questionText}"`);
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

    // 1. Validate respondent email
    const cleanEmail = respondentEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter your email address to record your response.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error('Please provide a valid email address (e.g. name@example.com).');
      return;
    }

    // 2. Validate all required questions
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
          toast.error(`Please answer Question ${i + 1}: "${q.questionText}"`);
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
        questionType: q.type,
        answer: val
      };
    });

    try {
      setSubmitting(true);
      await responseApi.submit({
        surveyId: id,
        respondentEmail: cleanEmail,
        answers: formattedAnswers
      });

      clearDraft();
      toast.success('Your submission has been securely recorded!');
      navigate('/thank-you');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
        message?: string;
      };

      if (
        axiosErr.response?.status === 409 ||
        axiosErr.response?.data?.message?.includes('already been recorded') ||
        axiosErr.message?.includes('already')
      ) {
        const msg =
          axiosErr.response?.data?.message ||
          `A submission from "${cleanEmail}" has already been recorded for this data collector. One email account cannot submit more than once.`;
        setConflictMessage(msg);
        setConflictModalOpen(true);
      } else {
        const errorMsg = axiosErr.response?.data?.message || 'Failed to submit response. Please try again.';
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading data collector...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Collector Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm">
          This data collector does not exist or has been closed.
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
          {survey.category && (
            <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {survey.category}
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
              title="Step-by-step wizard view"
              aria-label="Step-by-step view"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'scroll' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400'
              }`}
              title="Continuous scroll view"
              aria-label="Continuous view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'wizard' && (
        <ProgressBar progress={progressPercent} showLabel={true} />
      )}

      {/* Collector Header */}
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

      {/* Respondent Email Section (1-submission-per-user enforcement) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Your Email Address <span className="text-emerald-600">*</span>
        </label>
        <p className="text-xs text-slate-500 leading-normal">
          One submission allowed per email address.
        </p>

        {isAuthenticated && user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs mt-2">
            <span className="text-slate-600">Submitting as:</span>
            <span className="font-semibold text-slate-900 font-mono">{user.email}</span>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <input
              type="email"
              required
              value={respondentEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => checkEmailEligibility(respondentEmail)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
            />

            {eligibility.checked && !eligibility.isEligible && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                {eligibility.message || 'This email has already submitted a response.'}
              </p>
            )}
          </div>
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
              Submit Response
            </Button>
          </div>
        </div>
      )}

      {/* Duplicate Submission Conflict Modal (Single-Submission Policy) */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title="Submission Already Recorded"
      >
        <div className="space-y-4 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="text-center space-y-1.5">
            <h4 className="text-base font-bold text-slate-900">
              One Submission Limit Reached
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              {conflictMessage || 'A response from your email has already been recorded for this data collector. To guarantee unique and authentic records, one user account cannot submit more than once.'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Recorded Email:</span>
              <span className="font-semibold text-slate-800">{respondentEmail}</span>
            </div>
            <div className="flex justify-between">
              <span>Collector ID:</span>
              <span className="font-mono text-slate-700">{id}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Explore Other Collectors
            </Button>
            <Link to={`/admin/results/${id}`} className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full"
              >
                View Collector Analytics
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TakeSurveyPage;
