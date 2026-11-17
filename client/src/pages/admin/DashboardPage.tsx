import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, FileText, Users, CheckCircle } from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { Survey } from '../../types';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import SurveyFilters from '../../features/surveys/components/SurveyFilters';
import SurveyList from '../../features/surveys/components/SurveyList';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveyApi.getAll();
      setSurveys(data.filter((s) => s.isActive !== false));
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/survey/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Survey link copied');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openDeleteConfirm = (survey: Survey) => {
    setSurveyToDelete(survey);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!surveyToDelete) return;
    try {
      await surveyApi.delete(surveyToDelete._id);
      toast.success('Survey deleted');
      setSurveys((prev) => prev.filter((s) => s._id !== surveyToDelete._id));
    } catch (err) {
      console.error('Failed to delete survey:', err);
    } finally {
      setDeleteModalOpen(false);
      setSurveyToDelete(null);
    }
  };

  const filteredSurveys = surveys.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalQuestions = surveys.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const totalResponses = surveys.reduce((acc, s) => acc + (s.responseCount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage surveys and track responses
          </p>
        </div>
        <Link to="/admin/create" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Create Survey
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Surveys</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{surveys.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Responses</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalResponses}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Questions</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalQuestions}</h3>
          </div>
        </div>
      </div>

      {/* Search / Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1">
        <SurveyFilters search={search} onSearchChange={setSearch} />
      </div>

      {/* Survey List Grid */}
      <SurveyList
        surveys={filteredSurveys}
        loading={loading}
        search={search}
        copiedId={copiedId}
        onCopyLink={handleCopyLink}
        onDelete={openDeleteConfirm}
        onCreateNew={() => navigate('/admin/create')}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Survey"
        message={`Are you sure you want to delete "${surveyToDelete?.title}"? This survey will no longer accept responses.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSurveyToDelete(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
