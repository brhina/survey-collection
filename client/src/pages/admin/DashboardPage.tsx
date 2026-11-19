import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, FileText, Users, CheckCircle, ChevronDown } from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { Survey, SurveyStatus } from '../../types';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import SurveyFilters from '../../features/surveys/components/SurveyFilters';
import SurveyList from '../../features/surveys/components/SurveyList';

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'survey', label: 'Surveys & Polls' },
  { id: 'registration', label: 'Registrations' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'inspection', label: 'Audits' },
  { id: 'application', label: 'Applications' }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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
      console.error('Error fetching data collectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/survey/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Collector link copied');
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
      toast.success('Data collector deleted');
      setSurveys((prev) => prev.filter((s) => s._id !== surveyToDelete._id));
    } catch (err) {
      console.error('Failed to delete collector:', err);
    } finally {
      setDeleteModalOpen(false);
      setSurveyToDelete(null);
    }
  };

  const handleStatusChange = async (surveyId: string, newStatus: SurveyStatus) => {
    try {
      // Optimistic update
      setSurveys((prev) =>
        prev.map((s) => (s._id === surveyId ? { ...s, status: newStatus } : s))
      );
      await surveyApi.updateStatus(surveyId, newStatus);
      toast.success(`Survey status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Failed to change survey status:', err);
      toast.error('Failed to update status');
      fetchSurveys();
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (s.category ? s.category === selectedCategory : selectedCategory === 'survey' || selectedCategory === 'general');

    const itemStatus = s.status || 'published';
    const matchesStatus = selectedStatus === 'all' || itemStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalQuestions = surveys.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const totalResponses = surveys.reduce((acc, s) => acc + (s.responseCount || 0), 0);

  const statusCounts = surveys.reduce(
    (acc, s) => {
      const st = s.status || 'published';
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6 sm:space-y-8 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Collector Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage data forms, surveys, registrations, and track unique verified submissions
          </p>
        </div>
        <Link to="/admin/create" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Create Data Collector
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collectors</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{surveys.length}</h3>
              <span className="text-xs text-slate-500 font-medium">
                ({statusCounts.published || 0} active, {statusCounts.draft || 0} drafts)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Submissions</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalResponses}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fields</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalQuestions}</h3>
          </div>
        </div>
      </div>

      {/* Filters: Category Tabs + (Status Select & Search) */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Status Select Input Box + Search Bar */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter Select Input Box */}
            <div className="relative w-full sm:w-44 shrink-0">
              <select
                id="status-filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer appearance-none"
                aria-label="Filter by Status"
              >
                <option value="all">All Statuses ({surveys.length})</option>
                <option value="published">● Published ({statusCounts.published || 0})</option>
                <option value="draft">● Drafts ({statusCounts.draft || 0})</option>
                <option value="closed">● Closed ({statusCounts.closed || 0})</option>
                <option value="archived">● Archived ({statusCounts.archived || 0})</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <SurveyFilters search={search} onSearchChange={setSearch} />
          </div>
        </div>

        {/* Survey List Grid */}
        <SurveyList
          surveys={filteredSurveys}
          loading={loading}
          search={search}
          copiedId={copiedId}
          onCopyLink={handleCopyLink}
          onDelete={openDeleteConfirm}
          onStatusChange={handleStatusChange}
          onCreateNew={() => navigate('/admin/create')}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Data Collector"
        message={`Are you sure you want to delete "${surveyToDelete?.title}"? All submitted response data will be permanently removed.`}
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
