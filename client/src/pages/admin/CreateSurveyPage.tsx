import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Eye,
  Save
} from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { CreateSurveyData, Question, QuestionType, CollectorCategory } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuestionBuilder from '../../features/surveys/components/builder/QuestionBuilder';
import SurveyLivePreview from '../../features/surveys/components/builder/SurveyLivePreview';

const CATEGORIES: { id: CollectorCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'survey', label: 'Survey' },
  { id: 'registration', label: 'Registration' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'inspection', label: 'Field Audit' },
  { id: 'application', label: 'Application' }
];

const FIELD_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'text', label: '+ Short Text' },
  { type: 'long-text', label: '+ Paragraph' },
  { type: 'email', label: '+ Email' },
  { type: 'number', label: '+ Number' },
  { type: 'phone', label: '+ Phone' },
  { type: 'date', label: '+ Date' },
  { type: 'dropdown', label: '+ Dropdown' },
  { type: 'multiple-choice', label: '+ Multiple Choice' },
  { type: 'checkbox', label: '+ Checkboxes' },
  { type: 'rating', label: '+ Rating' }
];

export const CreateSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [survey, setSurvey] = useState<CreateSurveyData>({
    title: '',
    description: '',
    category: 'general',
    settings: {
      isAnonymous: false,
      allowMultipleSubmissions: false
    },
    questions: [
      {
        type: 'text',
        questionText: 'Full Name',
        isRequired: true,
        order: 0
      },
      {
        type: 'email',
        questionText: 'Contact Email Address',
        isRequired: true,
        order: 1
      }
    ]
  });

  const loadTemplate = (category: CollectorCategory) => {
    if (category === 'registration') {
      setSurvey({
        title: 'Event Attendee & Hackathon Registration',
        description: 'Complete this form to reserve your seat. One verified registration is permitted per email.',
        category: 'registration',
        settings: { isAnonymous: false, allowMultipleSubmissions: false },
        questions: [
          { type: 'text', questionText: 'Full Name', isRequired: true, order: 0 },
          { type: 'email', questionText: 'Primary Email Address', isRequired: true, order: 1 },
          { type: 'phone', questionText: 'Mobile / WhatsApp Number', isRequired: true, order: 2 },
          {
            type: 'dropdown',
            questionText: 'Selected Track / Workshop',
            options: ['AI & Agentic Systems', 'Cloud & Architecture', 'Full-Stack Design'],
            isRequired: true,
            order: 3
          },
          { type: 'number', questionText: 'Expected Team Size (1-5)', isRequired: true, order: 4 },
          { type: 'long-text', questionText: 'Dietary preferences or special requirements', isRequired: false, order: 5 }
        ]
      });
      toast.success('Registration template loaded');
    } else if (category === 'feedback') {
      setSurvey({
        title: 'Customer Feedback & Product Review',
        description: 'Tell us about your experience using our product and what we can improve.',
        category: 'feedback',
        settings: { isAnonymous: false, allowMultipleSubmissions: false },
        questions: [
          { type: 'rating', questionText: 'Overall satisfaction with our platform', isRequired: true, order: 0 },
          {
            type: 'multiple-choice',
            questionText: 'How frequently do you use this tool?',
            options: ['Daily', 'Weekly', 'Monthly', 'First time'],
            isRequired: true,
            order: 1
          },
          {
            type: 'checkbox',
            questionText: 'Which features do you find most valuable?',
            options: ['Data Export', 'Instant Analytics', 'Form Wizard Mode', 'Duplicate Prevention'],
            isRequired: true,
            order: 2
          },
          { type: 'long-text', questionText: 'What is one feature we should build next?', isRequired: false, order: 3 }
        ]
      });
      toast.success('Feedback template loaded');
    } else if (category === 'inspection') {
      setSurvey({
        title: 'Site Safety & Field Audit Checklist',
        description: 'Routine site quality assurance log and compliance verification report.',
        category: 'inspection',
        settings: { isAnonymous: false, allowMultipleSubmissions: false },
        questions: [
          { type: 'text', questionText: 'Inspector / Auditor Name', isRequired: true, order: 0 },
          { type: 'date', questionText: 'Audit Date', isRequired: true, order: 1 },
          {
            type: 'dropdown',
            questionText: 'Facility Location',
            options: ['Main Campus HQ', 'North Logistics Center', 'South Lab Facility'],
            isRequired: true,
            order: 2
          },
          {
            type: 'multiple-choice',
            questionText: 'Safety standards compliance status',
            options: ['Pass - No Violations', 'Pass - Minor Advisory', 'Fail - Remediation Required'],
            isRequired: true,
            order: 3
          },
          { type: 'number', questionText: 'Observed Risk Rating Score (1-100)', isRequired: true, order: 4 },
          { type: 'long-text', questionText: 'Corrective action items or notes', isRequired: false, order: 5 }
        ]
      });
      toast.success('Inspection template loaded');
    } else {
      setSurvey((prev) => ({ ...prev, category }));
      toast.success(`Category set to ${category}`);
    }
  };

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
      toast.error('Collector must contain at least one question or field');
      return;
    }
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async (targetStatus: 'published' | 'draft' = 'published') => {
    if (!survey.title.trim()) {
      toast.error('Please enter a title for this data collector');
      return;
    }

    if (!survey.description.trim()) {
      toast.error('Please enter a description or instructions');
      return;
    }

    for (let i = 0; i < survey.questions.length; i++) {
      const q = survey.questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Field / Question ${i + 1} cannot be empty`);
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
      await surveyApi.create({ ...survey, status: targetStatus });
      toast.success(
        targetStatus === 'draft'
          ? 'Data collector saved as draft'
          : 'Data collector published successfully'
      );
      navigate('/admin');
    } catch (error) {
      console.error('Failed to create collector:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreate('published');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <Breadcrumb items={[{ label: 'Create Data Collector' }]} />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create Data Collector</h1>
          <p className="text-xs text-slate-500">Configure fields, category, and single-submission unique email sync</p>
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
          {/* Category Picker */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Collector Category
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = survey.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => loadTemplate(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Collector Title <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Workshop Registration Form / Employee Feedback / Equipment Inspection"
                value={survey.title}
                onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description & Instructions <span className="text-emerald-600">*</span>
              </label>
              <textarea
                placeholder="Provide instructions or purpose for this data collection..."
                value={survey.description}
                onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none bg-white"
                required
              />
            </div>
          </div>

          {/* Fields / Questions Add bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Fields & Questions</span>
                <Badge variant="emerald">{survey.questions.length}</Badge>
              </h2>
              <span className="text-xs text-slate-400">Click to add field</span>
            </div>

            {/* Field Type Buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
              {FIELD_TYPES.map((ft) => (
                <button
                  key={ft.type}
                  type="button"
                  onClick={() => addQuestion(ft.type)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 shrink-0 transition-colors cursor-pointer"
                >
                  {ft.label}
                </button>
              ))}
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="md"
                isLoading={submitting}
                onClick={() => handleCreate('draft')}
                className="w-full sm:w-auto"
                leftIcon={<Save className="w-4 h-4 text-amber-600" />}
              >
                Save as Draft
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={submitting}
                className="w-full sm:w-auto"
                leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[2.2]" />}
              >
                Publish Data Collector
              </Button>
            </div>
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
