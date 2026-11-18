import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Copy,
  FileSpreadsheet,
  FileJson,
  BarChart2,
  ListOrdered
} from 'lucide-react';
import { surveyApi } from '../../features/surveys/api/surveyApi';
import { responseApi } from '../../features/responses/api/responseApi';
import { Survey, SurveyResultsData, RawResponseRecord } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import MetricsOverview from '../../features/analytics/components/MetricsOverview';
import QuestionChart from '../../features/analytics/components/QuestionChart';
import ResponseTable from '../../features/analytics/components/ResponseTable';

export const SurveyResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResultsData | null>(null);
  const [rawResponses, setRawResponses] = useState<RawResponseRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'responses'>('analytics');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (surveyId: string) => {
    try {
      setLoading(true);
      const [surveyData, resultsData, rawData] = await Promise.all([
        surveyApi.getById(surveyId),
        responseApi.getResults(surveyId),
        responseApi.getAllResponses(surveyId)
      ]);
      setSurvey(surveyData);
      setResults(resultsData);
      setRawResponses(rawData);
    } catch (err) {
      console.error('Failed to load survey results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!id) return;
    const url = `${window.location.origin}/survey/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Survey link copied');
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!id) return;
    try {
      await surveyApi.downloadExport(id, format);
      toast.success(`Exported ${format.toUpperCase()}`);
    } catch {
      const url = surveyApi.getExportUrl(id, format);
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading results...</p>
      </div>
    );
  }

  if (!survey || !results) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Survey Not Found</h2>
        <Link to="/admin">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Collector Results & Data</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copy Link
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('csv')}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />}
          >
            CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            leftIcon={<FileJson className="w-3.5 h-3.5" />}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* Summary */}
      <MetricsOverview survey={survey} results={results} />

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('responses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'responses'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Responses ({rawResponses.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <div className="space-y-4 sm:space-y-6">
          {survey.questions.map((question, qIdx) => {
            const analysis = results.results[qIdx];
            return (
              <div
                key={qIdx}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Question {qIdx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                      {question.questionText}
                    </h3>
                  </div>

                  <Badge variant="slate" className="self-start sm:self-auto shrink-0 font-semibold">
                    {analysis?.totalResponses || 0} answered
                  </Badge>
                </div>

                <QuestionChart analysis={analysis} />
              </div>
            );
          })}
        </div>
      ) : (
        <ResponseTable survey={survey} responses={rawResponses} />
      )}
    </div>
  );
};

export default SurveyResultsPage;
