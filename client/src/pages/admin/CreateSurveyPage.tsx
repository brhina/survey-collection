import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  List,
  CheckSquare,
  Star,
  Type,
  AlignLeft,
  ChevronDown
} from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { CreateSurveyData, Question, QuestionType } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import QuestionBuilder from '../../features/surveys/components/builder/QuestionBuilder';
import SurveyLivePreview from '../../features/surveys/components/builder/SurveyLivePreview';

export const CreateSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [survey, setSurvey] = useState<CreateSurveyData>({
    title: '',
    description: '',
    settings: {
      isAnonymous: false,
      allowMultipleSubmissions: false
    },
    questions: [
      {
        type: 'multiple-choice',
        questionText: '',
        options: ['Option 1', 'Option 2'],
        isRequired: true,
        order: 0
      }
    ]
  });

  const addQuestion = (type: QuestionType) => {
    const defaultOptions =
      type === 'multiple-choice' || type === 'checkbox' || type === 'dropdown'
        ? ['Option 1', 'Option 2']
        : [];

    const newQuestion: Question = {
      type,
      questionText: '',
      options: defaultOptions,
      isRequired: true,
      order: survey.questions.length
    };

    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const changeQuestionType = (index: number, newType: QuestionType) => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const current = questions[index];
      const needsOptions = ['multiple-choice', 'checkbox', 'dropdown'].includes(newType);
      const hadOptions = ['multiple-choice', 'checkbox', 'dropdown'].includes(current.type);

      questions[index] = {
        ...current,
        type: newType,
        options: needsOptions ? (hadOptions && current.options?.length ? current.options : ['Option 1', 'Option 2']) : []
      };
      return { ...prev, questions };
    });
  };

  const addOption = (questionIndex: number) => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const options = [...(questions[questionIndex].options || [])];
      options.push(`Option ${options.length + 1}`);
      questions[questionIndex].options = options;
      return { ...prev, questions };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const options = [...(questions[questionIndex].options || [])];
      options[optionIndex] = value;
      questions[questionIndex].options = options;
      return { ...prev, questions };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const options = questions[questionIndex].options?.filter((_, i) => i !== optionIndex) || [];
      questions[questionIndex].options = options;
      return { ...prev, questions };
    });
  };

  const duplicateQuestion = (index: number) => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const target = questions[index];
      const cloned: Question = {
        ...target,
        questionText: target.questionText ? `${target.questionText} (Copy)` : '',
        options: target.options ? [...target.options] : []
      };
      questions.splice(index + 1, 0, cloned);
      return { ...prev, questions };
    });
    toast.success('Question duplicated');
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setSurvey((prev) => {
      const questions = [...prev.questions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= questions.length) return prev;
      const temp = questions[index];
      questions[index] = questions[targetIndex];
      questions[targetIndex] = temp;
      return { ...prev, questions };
    });
  };

  const removeQuestion = (index: number) => {
    if (survey.questions.length <= 1) {
      toast.error('Survey must contain at least one question');
      return;
    }
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!survey.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }

    if (!survey.description.trim()) {
      toast.error('Please enter a survey description');
      return;
    }

    for (let i = 0; i < survey.questions.length; i++) {
      const q = survey.questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} cannot be empty`);
        return;
      }
      if (['multiple-choice', 'checkbox', 'dropdown'].includes(q.type)) {
        if (!q.options || q.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      await surveyApi.create(survey);
      toast.success('Survey created successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to create survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create Survey</h1>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Title <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Survey title"
                value={survey.title}
                onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description <span className="text-emerald-600">*</span>
              </label>
              <textarea
                placeholder="Survey description or instructions"
                value={survey.description}
                onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none bg-white"
                required
              />
            </div>
          </div>

          {/* Question Add bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Questions</span>
                <Badge variant="emerald">{survey.questions.length}</Badge>
              </h2>
            </div>

            {/* Responsive Question Type Buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('multiple-choice')}
                leftIcon={<List className="w-3.5 h-3.5 text-emerald-600" />}
                className="shrink-0 text-xs"
              >
                Multiple Choice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('checkbox')}
                leftIcon={<CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                className="shrink-0 text-xs"
              >
                Checkboxes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('rating')}
                leftIcon={<Star className="w-3.5 h-3.5 text-emerald-600" />}
                className="shrink-0 text-xs"
              >
                Rating
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('text')}
                leftIcon={<Type className="w-3.5 h-3.5 text-emerald-600" />}
                className="shrink-0 text-xs"
              >
                Short Text
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('long-text')}
                leftIcon={<AlignLeft className="w-3.5 h-3.5 text-emerald-600" />}
                className="shrink-0 text-xs"
              >
                Paragraph
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('dropdown')}
                leftIcon={<ChevronDown className="w-3.5 h-3.5 text-emerald-600" />}
                className="shrink-0 text-xs"
              >
                Dropdown
              </Button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            {survey.questions.map((q, qIndex) => (
              <QuestionBuilder
                key={qIndex}
                question={q}
                index={qIndex}
                totalQuestions={survey.questions.length}
                onUpdate={(field, val) => updateQuestion(qIndex, field, val)}
                onTypeChange={(newType) => changeQuestionType(qIndex, newType)}
                onMove={(direction) => moveQuestion(qIndex, direction)}
                onDuplicate={() => duplicateQuestion(qIndex)}
                onRemove={() => removeQuestion(qIndex)}
                onAddOption={() => addOption(qIndex)}
                onUpdateOption={(oIndex, val) => updateOption(qIndex, oIndex, val)}
                onRemoveOption={(oIndex) => removeOption(qIndex, oIndex)}
              />
            ))}
          </div>

          {/* Submit / Cancel Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
            <Link to="/admin" className="w-full sm:w-auto">
              <Button type="button" variant="outline" size="md" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              className="w-full sm:w-auto"
              leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[2.2]" />}
            >
              Publish Survey
            </Button>
          </div>
        </form>
      ) : (
        <SurveyLivePreview
          survey={survey}
          onReturnToEdit={() => setActiveTab('edit')}
        />
      )}
    </div>
  );
};

export default CreateSurveyPage;
