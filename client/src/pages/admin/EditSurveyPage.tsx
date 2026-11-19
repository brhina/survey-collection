import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  Save,
  Sliders,
  AlertTriangle,
  Send,
  Lock,
  Archive,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import {
  Question,
  QuestionType,
  CollectorCategory,
  SurveyStatus,
  SurveySettings,
  Survey
} from '../../types';
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

const STATUS_CONFIG: Record<
  SurveyStatus,
  { label: string; badgeVariant: 'emerald' | 'amber' | 'slate' | 'rose'; description: string }
> = {
  published: {
    label: 'Published (Active)',
    badgeVariant: 'emerald',
    description: 'Active and accepting submissions from respondents'
  },
  draft: {
    label: 'Draft',
    badgeVariant: 'amber',
    description: 'Hidden from respondents; only admins can edit and preview'
  },
  closed: {
    label: 'Closed',
    badgeVariant: 'slate',
    description: 'Submissions locked; results and historical analytics preserved'
  },
  archived: {
    label: 'Archived',
    badgeVariant: 'rose',
    description: 'Soft-deleted and removed from active dashboards'
  }
};

export const EditSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'settings' | 'preview'>('builder');

  const [originalSurvey, setOriginalSurvey] = useState<Survey | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<CollectorCategory>('general');
  const [status, setStatus] = useState<SurveyStatus>('published');
  const [settings, setSettings] = useState<SurveySettings>({
    isAnonymous: false,
    allowMultipleSubmissions: false,
    requireAuth: false,
    responseLimit: null,
    opensAt: null,
    closesAt: null
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (id) {
      loadSurvey(id);
    }
  }, [id]);

  const loadSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      const data = await surveyApi.getById(surveyId);
      setOriginalSurvey(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setCategory(data.category || 'general');
      setStatus(data.status || 'published');
      setSettings(
        data.settings || {
          isAnonymous: false,
          allowMultipleSubmissions: false,
          requireAuth: false,
          responseLimit: null,
          opensAt: null,
          closesAt: null
        }
      );
      setQuestions(
        (data.questions || []).map((q, idx) => ({
          ...q,
          order: q.order !== undefined ? q.order : idx
        }))
      );
    } catch (err) {
      console.error('Failed to load collector for editing:', err);
      toast.error('Failed to load survey details');
    } finally {
      setLoading(false);
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
      order: questions.length
    };

    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const changeQuestionType = (index: number, newType: QuestionType) => {
    setQuestions((prev) => {
      const next = [...prev];
      const current = next[index];
      const needsOptions = ['multiple-choice', 'checkbox', 'dropdown'].includes(newType);
      const hadOptions = ['multiple-choice', 'checkbox', 'dropdown'].includes(current.type);

      next[index] = {
        ...current,
        type: newType,
        options: needsOptions
          ? hadOptions && current.options?.length
            ? current.options
            : ['Option 1', 'Option 2']
          : []
      };
      return next;
    });
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const options = [...(next[questionIndex].options || [])];
      options.push(`Option ${options.length + 1}`);
      next[questionIndex].options = options;
      return next;
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const options = [...(next[questionIndex].options || [])];
      options[optionIndex] = value;
      next[questionIndex].options = options;
      return next;
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const options = next[questionIndex].options?.filter((_, i) => i !== optionIndex) || [];
      next[questionIndex].options = options;
      return next;
    });
  };

  const duplicateQuestion = (index: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const target = next[index];
      const cloned: Question = {
        ...target,
        _id: undefined, // New question instance
        questionText: target.questionText ? `${target.questionText} (Copy)` : '',
        options: target.options ? [...target.options] : []
      };
      next.splice(index + 1, 0, cloned);
      return next;
    });
    toast.success('Question duplicated');
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Survey must contain at least one question or field');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Please enter a title for this data collector');
      return false;
    }

    if (!description.trim()) {
      toast.error('Please enter a description or instructions');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text cannot be empty`);
        return false;
      }
      if (['multiple-choice', 'checkbox', 'dropdown'].includes(q.type)) {
        if (!q.options || q.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async (overrideStatus?: SurveyStatus) => {
    if (!id) return;
    if (!validateForm()) return;

    const targetStatus = overrideStatus || status;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        status: targetStatus,
        settings,
        questions: questions.map((q, idx) => ({
          ...q,
          order: idx
        }))
      };

      await surveyApi.update(id, payload);
      setStatus(targetStatus);
      toast.success(
        overrideStatus
          ? `Survey updated and status set to "${STATUS_CONFIG[targetStatus].label}"`
          : 'Survey changes saved successfully!'
      );
      navigate('/admin');
    } catch (err) {
      console.error('Failed to save survey changes:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading survey editor...</p>
      </div>
    );
  }

  if (!originalSurvey) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Survey Not Found</h2>
        <p className="text-sm text-slate-500">The requested survey could not be found or has been deleted.</p>
        <Link to="/admin">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const responseCount = originalSurvey.responseCount || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <Breadcrumb
            items={[
              { label: originalSurvey.title || 'Collector', href: `/admin/results/${id}` },
              { label: 'Edit' }
            ]}
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Edit Data Collector</h1>
            <Badge variant={STATUS_CONFIG[status]?.badgeVariant || 'slate'}>
              {STATUS_CONFIG[status]?.label || status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Update fields, modify survey lifecycle status, or customize collection settings
          </p>
        </div>

        {/* View / Tab Switcher & Quick Navigation */}
        <div className="flex items-center gap-2">
          {id && (
            <Link to={`/admin/results/${id}`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BarChart2 className="w-3.5 h-3.5 text-emerald-600" />}
                className="text-xs"
              >
                Results ({responseCount})
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Settings & Status</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Response Count Warning Banner if responses exist */}
      {responseCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 space-y-1">
            <p className="font-semibold">
              This data collector has {responseCount} active submission{responseCount > 1 ? 's' : ''}.
            </p>
            <p className="text-amber-800 text-xs">
              Deleting fields or changing multiple-choice options might disconnect previously collected responses. We
              recommend closing the survey or creating a new version if major schema changes are required.
            </p>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Quick Status Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Collector Lifecycle Status
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{STATUS_CONFIG[status]?.description}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['draft', 'published', 'closed', 'archived'] as SurveyStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer capitalize ${
                    status === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Collector Category
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
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
                placeholder="e.g. Hackathon Registration / Employee Satisfaction / Equipment Audit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description & Instructions <span className="text-emerald-600">*</span>
              </label>
              <textarea
                placeholder="Provide instructions or purpose for respondents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none bg-white"
                required
              />
            </div>
          </div>

          {/* Fields / Questions Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Fields & Questions</span>
                <Badge variant="emerald">{questions.length}</Badge>
              </h2>
              <span className="text-xs text-slate-400">Click a field type to append</span>
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
            {questions.map((q, qIndex) => (
              <QuestionBuilder
                key={q._id || `edit_q_${qIndex}`}
                question={q}
                index={qIndex}
                totalQuestions={questions.length}
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
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Status Selection Cards */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Survey Lifecycle Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control availability and who can view or take this collector</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(
                [
                  {
                    id: 'published',
                    name: 'Published (Active)',
                    icon: Send,
                    desc: 'Accepting submissions. Listed publicly and ready for respondents.'
                  },
                  {
                    id: 'draft',
                    name: 'Draft',
                    icon: Save,
                    desc: 'Work in progress. Submissions disabled; accessible only in admin editor.'
                  },
                  {
                    id: 'closed',
                    name: 'Closed',
                    icon: Lock,
                    desc: 'Responses closed. Respondents see a closed notice; results remain accessible.'
                  },
                  {
                    id: 'archived',
                    name: 'Archived',
                    icon: Archive,
                    desc: 'Archived collector. Hidden from standard lists.'
                  }
                ] as const
              ).map((item) => {
                const isSelected = status === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submission and Privacy Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Submission Constraints & Access</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure submission policies and capacity limits</p>
            </div>

            <div className="space-y-4 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMultipleSubmissions || false}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, allowMultipleSubmissions: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800">Allow Multiple Submissions Per User</span>
                  <p className="text-xs text-slate-500">
                    When disabled (recommended), the system enforces 1 response per unique email address.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isAnonymous || false}
                  onChange={(e) => setSettings((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800">Anonymous Mode</span>
                  <p className="text-xs text-slate-500">
                    Hide respondent identifying details in public reports and analytics exports.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireAuth || false}
                  onChange={(e) => setSettings((prev) => ({ ...prev, requireAuth: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800">Require User Authentication</span>
                  <p className="text-xs text-slate-500">Respondents must log in before accessing the questionnaire.</p>
                </div>
              </label>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Response Cap (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited responses"
                  value={settings.responseLimit ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null;
                    setSettings((prev) => ({ ...prev, responseLimit: val }));
                  }}
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Survey will automatically lock and reject new submissions once this count is met.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Tab */}
      {activeTab === 'preview' && (
        <SurveyLivePreview
          survey={{
            title,
            description,
            category,
            status,
            settings,
            questions
          }}
          onReturnToEdit={() => setActiveTab('builder')}
        />
      )}

      {/* Sticky Bottom Actions Bar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button type="button" variant="outline" size="md" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>

          {id && (
            <Link to={`/survey/${id}`} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                variant="ghost"
                size="md"
                leftIcon={<ExternalLink className="w-4 h-4 text-slate-400" />}
              >
                Open Respondent View
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick status shortcut buttons */}
          {status === 'draft' && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              isLoading={submitting}
              onClick={() => handleSave('published')}
              leftIcon={<Send className="w-4 h-4 text-emerald-600" />}
            >
              Publish Now
            </Button>
          )}

          {status === 'published' && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              isLoading={submitting}
              onClick={() => handleSave('closed')}
              leftIcon={<Lock className="w-4 h-4 text-slate-600" />}
            >
              Close Survey
            </Button>
          )}

          {status === 'closed' && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              isLoading={submitting}
              onClick={() => handleSave('published')}
              leftIcon={<Send className="w-4 h-4 text-emerald-600" />}
            >
              Re-open Survey
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={submitting}
            onClick={() => handleSave()}
            leftIcon={<Save className="w-4 h-4 stroke-[2.2]" />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditSurveyPage;
