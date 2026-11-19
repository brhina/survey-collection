import { apiClient } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  AiAnalysisRecord,
  DecisionOverridePayload,
  StreamPhaseEvent
} from '../types/aiTypes';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const aiApi = {
  /**
   * Retrieves the latest cached/persisted AI analysis for a collector.
   */
  async getLatest(surveyId: string): Promise<AiAnalysisRecord | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: AiAnalysisRecord | null }>(
        API_ENDPOINTS.AI.LATEST(surveyId)
      );
      return res.data?.data || null;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Synchronously triggers or fetches AI decision analysis.
   */
  async analyze(surveyId: string, forceRefresh: boolean = false): Promise<AiAnalysisRecord> {
    const res = await apiClient.post<{ success: boolean; data: AiAnalysisRecord }>(
      API_ENDPOINTS.AI.ANALYZE(surveyId),
      {},
      { params: { forceRefresh } }
    );
    return res.data.data;
  },

  /**
   * Real-time Server-Sent Events (SSE) stream for live phase tracking and progressive generation.
   */
  async streamAnalysis(
    surveyId: string,
    options: {
      forceRefresh?: boolean;
      onPhase?: (event: StreamPhaseEvent) => void;
      onComplete?: (result: AiAnalysisRecord) => void;
      onError?: (error: Error) => void;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const token = localStorage.getItem('survey_auth_token');
    const url = `${BASE_URL}${API_ENDPOINTS.AI.STREAM(surveyId)}?forceRefresh=${Boolean(options.forceRefresh)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: options.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SSE Connection failed [${response.status}]: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser environment.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message';
          let eventData = '';

          const blockLines = block.split('\n');
          for (const line of blockLines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              eventData = line.replace('data:', '').trim();
            }
          }

          if (eventType === 'phase') {
            try {
              const phaseObj = JSON.parse(eventData);
              options.onPhase?.(phaseObj);
            } catch {
              // Ignore partial parse
            }
          } else if (eventType === 'complete') {
            try {
              const completeObj = JSON.parse(eventData);
              options.onComplete?.(completeObj);
            } catch (err: any) {
              options.onError?.(new Error('Failed to parse final analysis payload'));
            }
          } else if (eventType === 'error') {
            try {
              const errObj = JSON.parse(eventData);
              options.onError?.(new Error(errObj.message || 'Stream error occurred'));
            } catch {
              options.onError?.(new Error('Unknown streaming error'));
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        options.onError?.(err);
      }
    }
  },

  /**
   * Human-in-the-Loop decision override.
   */
  async overrideDecision(
    surveyId: string,
    payload: DecisionOverridePayload
  ): Promise<{ id: string; analysis: any; humanOverride: any }> {
    const res = await apiClient.post(API_ENDPOINTS.AI.OVERRIDE(surveyId), payload);
    return res.data.data;
  },

  /**
   * Interactive conversational question against collector data.
   */
  async chat(
    surveyId: string,
    question: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{ answer: string; modelName: string; provider: string }> {
    const res = await apiClient.post(API_ENDPOINTS.AI.CHAT(surveyId), {
      question,
      history
    });
    return res.data.data;
  }
};

export default aiApi;
