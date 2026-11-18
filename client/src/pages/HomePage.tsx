import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { surveyApi } from '../features/surveys/api/surveyApi';
import { Survey } from '../types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SurveyFilters from '../features/surveys/components/SurveyFilters';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/feedback/EmptyState';
import { formatDate } from '../utils/formatters';

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Collectors' },
  { id: 'survey', label: 'Surveys & Polls' },
  { id: 'registration', label: 'Registrations' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'inspection', label: 'Field Audits' },
  { id: 'application', label: 'Applications' },
  { id: 'general', label: 'General' }
];

export const HomePage: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveyApi.getAll();
      setSurveys(data.filter((s) => s.isActive !== false));
    } catch (err) {
      console.error('Failed to load data collectors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (s.category ? s.category === selectedCategory : selectedCategory === 'survey' || selectedCategory === 'general');

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* Available Collectors Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Data Collectors & Forms
            </h2>
            {!loading && (
              <Badge variant="emerald" className="font-semibold text-xs">
                {filteredSurveys.length} Available
              </Badge>
            )}
          </div>

          <SurveyFilters search={search} onSearchChange={setSearch} />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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

        {loading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full rounded-xl mt-3" />
              </div>
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <EmptyState
            title={search || selectedCategory !== 'all' ? 'No matching collectors' : 'No active collectors'}
            description={
              search || selectedCategory !== 'all'
                ? 'Try selecting a different category or clearing search filters.'
                : 'There are currently no active data collectors available. Please check back later.'
            }
          />
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredSurveys.map((survey) => (
              <div
                key={survey._id}
                className="group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {survey.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {survey.category}
                        </span>
                      )}
                      <Badge variant="emerald">
                        {survey.questions?.length || 0} Fields
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(survey.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5">
                    {survey.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {survey.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {survey.responseCount ?? 0} submissions
                  </span>

                  <Link to={`/survey/${survey._id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      }
                    >
                      Fill Form
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
