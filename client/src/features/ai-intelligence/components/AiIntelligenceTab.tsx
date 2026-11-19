import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  FileDown,
  Edit3,
  Bot,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Survey, SurveyResultsData, RawResponseRecord } from '../../../types';
import Button from '../../../components/ui/Button';
import useAiCollectorAnalysis from '../hooks/useAiCollectorAnalysis';
import AiDecisionBanner from './AiDecisionBanner';
import AiExecutiveSummaryCard from './AiExecutiveSummaryCard';
import AiThemeClusterGrid from './AiThemeClusterGrid';
import AiEvidenceDrawer from './AiEvidenceDrawer';
import AiRiskMatrixTable from './AiRiskMatrixTable';
import AiActionRoadmapList from './AiActionRoadmapList';
import AiStreamingThinkingState from './AiStreamingThinkingState';
import AiHumanOverrideModal from './AiHumanOverrideModal';
import AiChatAssistantDrawer from './AiChatAssistantDrawer';

interface AiIntelligenceTabProps {
  survey: Survey;
  results: SurveyResultsData;
  rawResponses: RawResponseRecord[];
}

export const AiIntelligenceTab: React.FC<AiIntelligenceTabProps> = ({
  survey,
  results: _results,
  rawResponses
}) => {
  const surveyId = survey._id;
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);

  const {
    analysisRecord,
    loading,
    isStreaming,
    streamPhase,
    error,
    generateAnalysis,
    recordOverride,
    exportReport
  } = useAiCollectorAnalysis(surveyId);

  const handleGenerate = (forceRefresh: boolean = false) => {
    generateAnalysis(forceRefresh);
  };

  if (loading && !isStreaming && !analysisRecord) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-400">Loading AI intelligence models...</p>
      </div>
    );
  }

  const analysis = analysisRecord?.analysis;
  const criticalRisksCount = analysis?.risks?.filter((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH').length || 0;
  const urgentTasksCount = analysis?.actionableRoadmap?.filter((t) => t.priority === 'P0_IMMEDIATE' || t.priority === 'P1_HIGH').length || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Intelligence Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
              Cognitive Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {survey.category || 'General'} Collector
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            AI Decision Intelligence & Synthesis
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Synthesizing {rawResponses.length} submissions with category decision rubrics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChatDrawerOpen(true)}
            leftIcon={<Bot className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Chat with Data
          </Button>

          {analysisRecord && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOverrideModalOpen(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Override Verdict
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport('markdown')}
                leftIcon={<FileDown className="w-3.5 h-3.5" />}
              >
                Export Brief
              </Button>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleGenerate(Boolean(analysisRecord))}
            isLoading={isStreaming}
            leftIcon={
              analysisRecord ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )
            }
          >
            {analysisRecord ? 'Force Re-Analyze' : 'Generate AI Decision & Analysis'}
          </Button>
        </div>
      </div>

      {/* Quick Summary Pill Bar when analysis is ready */}
      {analysis && !isStreaming && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Confidence
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {analysis.verdict.confidenceScore}%
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Decision
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 mt-1 truncate">
              {analysis.verdict.decision}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              High Risks
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {criticalRisksCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              Priority Actions
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {urgentTasksCount}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && !isStreaming && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Notice:</span> {error}
            <div className="pt-1">
              <button
                onClick={() => handleGenerate(true)}
                className="text-rose-700 hover:text-rose-800 font-bold underline cursor-pointer"
              >
                Retry Generation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Streaming State */}
      {isStreaming && <AiStreamingThinkingState streamPhase={streamPhase} />}

      {/* Empty State when no analysis generated yet */}
      {!analysisRecord && !isStreaming && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Instant AI Decision & Multi-Dimensional Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Eliminate hours of manual data reading. Automatically evaluate {rawResponses.length} submissions against domain criteria, identify bottlenecks, and formulate an official operational verdict.
            </p>
          </div>

          {/* 3 Core Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-900 block">🏛️ Clear Decision Verdict</span>
              <p className="text-[11px] text-slate-500">
                Determines PASSED, CONDITIONAL, REJECT, or PIVOT with confidence scoring.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-900 block">📊 Semantic Clustering</span>
              <p className="text-[11px] text-slate-500">
                Extracts key sentiment themes across all open-ended qualitative comments.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-900 block">🎯 Actionable Roadmap</span>
              <p className="text-[11px] text-slate-500">
                P0-P3 prioritized tasks assigned with owner roles and timeframes.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleGenerate(false)}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate AI Decision & Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Full AI Analysis Dashboard: Structured 2-Column Layout */}
      {analysisRecord && !isStreaming && (
        <div className="space-y-6 sm:space-y-8">
          {/* 1. Hero Decision Banner */}
          <AiDecisionBanner
            verdict={analysisRecord.analysis.verdict}
            category={analysisRecord.analysis.category || survey.category || 'general'}
            humanOverride={analysisRecord.humanOverride}
            onOpenOverrideModal={() => setIsOverrideModalOpen(true)}
          />

          {/* 2. Executive Leadership Briefing Card */}
          <AiExecutiveSummaryCard
            analysis={analysisRecord.analysis}
            modelName={analysisRecord.modelName}
            provider={analysisRecord.provider}
            tokenUsage={analysisRecord.tokenUsage}
            cached={analysisRecord.cached}
            createdAt={analysisRecord.createdAt}
            totalResponsesAnalyzed={analysisRecord.responseCountAtAnalysis || rawResponses.length}
          />

          {/* 3. Responsive 2-Column Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Column A: Semantic Sentiment & Evidence Citations */}
            <div className="space-y-6">
              {analysisRecord.analysis.keyThemes && analysisRecord.analysis.keyThemes.length > 0 && (
                <AiThemeClusterGrid themes={analysisRecord.analysis.keyThemes} />
              )}

              {analysisRecord.analysis.citations && analysisRecord.analysis.citations.length > 0 && (
                <AiEvidenceDrawer citations={analysisRecord.analysis.citations} />
              )}
            </div>

            {/* Column B: Operational Risk Matrix & Action Roadmap */}
            <div className="space-y-6">
              {analysisRecord.analysis.risks && analysisRecord.analysis.risks.length > 0 && (
                <AiRiskMatrixTable risks={analysisRecord.analysis.risks} />
              )}

              {analysisRecord.analysis.actionableRoadmap && (
                <AiActionRoadmapList roadmap={analysisRecord.analysis.actionableRoadmap} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Human-in-the-Loop Override Dialog */}
      {analysisRecord && (
        <AiHumanOverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          currentDecision={analysisRecord.analysis.verdict.decision}
          category={analysisRecord.analysis.category || survey.category || 'general'}
          onSubmitOverride={recordOverride}
        />
      )}

      {/* Interactive Chat with Collector Data Drawer */}
      <AiChatAssistantDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        surveyId={surveyId}
        surveyTitle={survey.title}
        category={survey.category || 'general'}
      />
    </div>
  );
};

export default AiIntelligenceTab;
