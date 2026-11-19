import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import aiApi from '../api/aiApi';
import {
  AiAnalysisRecord,
  DecisionOverridePayload,
  StreamPhaseEvent
} from '../types/aiTypes';

export interface UseAiCollectorAnalysisReturn {
  analysisRecord: AiAnalysisRecord | null;
  loading: boolean;
  isStreaming: boolean;
  streamPhase: StreamPhaseEvent | null;
  error: string | null;
  loadLatest: () => Promise<void>;
  generateAnalysis: (forceRefresh?: boolean) => Promise<void>;
  recordOverride: (payload: DecisionOverridePayload) => Promise<boolean>;
  exportReport: (format?: 'markdown' | 'text') => void;
}

export const useAiCollectorAnalysis = (surveyId: string): UseAiCollectorAnalysisReturn => {
  const [analysisRecord, setAnalysisRecord] = useState<AiAnalysisRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamPhase, setStreamPhase] = useState<StreamPhaseEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadLatest = useCallback(async () => {
    if (!surveyId) return;
    try {
      setLoading(true);
      setError(null);
      const record = await aiApi.getLatest(surveyId);
      setAnalysisRecord(record);
    } catch (err: any) {
      console.error('Failed to fetch latest AI analysis:', err);
      setError(err?.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    loadLatest();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadLatest]);

  const generateAnalysis = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!surveyId) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsStreaming(true);
      setError(null);
      setStreamPhase({ phase: 'CONNECTING', message: 'Establishing streaming channel...' });

      try {
        await aiApi.streamAnalysis(surveyId, {
          forceRefresh,
          signal: controller.signal,
          onPhase: (phaseEvent) => {
            setStreamPhase(phaseEvent);
          },
          onComplete: (completedRecord) => {
            setAnalysisRecord(completedRecord);
            setIsStreaming(false);
            setStreamPhase(null);
            toast.success(
              completedRecord.cached
                ? 'Loaded AI analysis from intelligent cache'
                : 'AI synthesis and decision generated successfully'
            );
          },
          onError: (err) => {
            console.error('Streaming error:', err);
            setError(err.message);
            setIsStreaming(false);
            setStreamPhase(null);
            toast.error(err.message || 'AI generation failed');
          }
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to stream AI analysis:', err);
          setError(err.message || 'Failed to generate AI analysis');
          setIsStreaming(false);
          setStreamPhase(null);
        }
      }
    },
    [surveyId]
  );

  const recordOverride = useCallback(
    async (payload: DecisionOverridePayload): Promise<boolean> => {
      if (!surveyId) return false;
      try {
        const updated = await aiApi.overrideDecision(surveyId, payload);
        if (analysisRecord) {
          setAnalysisRecord({
            ...analysisRecord,
            analysis: {
              ...analysisRecord.analysis,
              verdict: {
                ...analysisRecord.analysis.verdict,
                decision: payload.newDecision,
                statusBadge: payload.statusBadge
              }
            },
            humanOverride: updated.humanOverride
          });
        }
        toast.success('Decision override recorded in compliance audit ledger');
        return true;
      } catch (err: any) {
        console.error('Failed to override decision:', err);
        toast.error(err.response?.data?.message || 'Failed to record override');
        return false;
      }
    },
    [surveyId, analysisRecord]
  );

  const exportReport = useCallback(
    (format: 'markdown' | 'text' = 'markdown') => {
      if (!analysisRecord) {
        toast.error('No AI analysis available to export');
        return;
      }

      const { analysis, modelName, provider, createdAt } = analysisRecord;
      const dateStr = createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString();

      let content = '';

      if (format === 'markdown') {
        content = `# Executive AI Decision & Synthesis Brief
**Collector Category:** ${analysis.category.toUpperCase()}
**Generated Date:** ${dateStr}
**Model / Engine:** ${modelName} (${provider})

---

## 🏛️ Operational Verdict: ${analysis.verdict.decision}
- **Status:** ${analysis.verdict.statusBadge}
- **Confidence Rating:** ${analysis.verdict.confidenceScore}%
- **Summary Headline:** ${analysis.verdict.verdictHeadline}

### Rationale & Chain-of-Thought
${analysis.verdict.coreJustification}

---

## 📋 Executive Summary
${analysis.executiveSummary}

---

## 🔍 Key Sentiment & Thematic Findings
${analysis.keyThemes
  .map(
    (t, i) =>
      `### ${i + 1}. ${t.theme} (${t.sentiment})
- **Affected Respondents:** ${t.percentageAffected}%
- **Summary:** ${t.summary}`
  )
  .join('\n\n')}

---

## ⚠️ Risk Matrix & Mitigations
${analysis.risks
  .map(
    (r, i) =>
      `### ${i + 1}. [${r.severity}] ${r.risk}
- **Likelihood:** ${r.likelihood}
- **Mandated Mitigation:** ${r.mitigation}`
  )
  .join('\n\n')}

---

## 🎯 Prioritized Actionable Roadmap
${analysis.actionableRoadmap
  .map(
    (item, i) =>
      `${i + 1}. **[${item.priority}]** ${item.actionItem}
   - *Assigned Role:* ${item.suggestedOwnerRole}
   - *Timeframe:* ${item.timeframe}`
  )
  .join('\n\n')}
`;
      } else {
        content = `EXECUTIVE AI DECISION REPORT
Collector Category: ${analysis.category.toUpperCase()}
Date: ${dateStr}
Verdict: ${analysis.verdict.decision} (${analysis.verdict.confidenceScore}% Confidence)

SUMMARY:
${analysis.executiveSummary}

CORE JUSTIFICATION:
${analysis.verdict.coreJustification}

ACTION ROADMAP:
${analysis.actionableRoadmap.map((item) => `[${item.priority}] ${item.actionItem} (${item.suggestedOwnerRole})`).join('\n')}
`;
      }

      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai_decision_report_${surveyId}.${format === 'markdown' ? 'md' : 'txt'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded Executive Brief');
    },
    [analysisRecord, surveyId]
  );

  return {
    analysisRecord,
    loading,
    isStreaming,
    streamPhase,
    error,
    loadLatest,
    generateAnalysis,
    recordOverride,
    exportReport
  };
};

export default useAiCollectorAnalysis;
