import { useState, useEffect } from 'react';
import storage from '../../../utils/storage';

export function useDraftAutoSave(surveyId?: string) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [draftRestored, setDraftRestored] = useState<boolean>(false);

  // Restore draft on mount
  useEffect(() => {
    if (!surveyId) return;
    const key = `survey_draft_${surveyId}`;
    const saved = storage.get<Record<string, unknown> | null>(key, null);
    if (saved && Object.keys(saved).length > 0) {
      setAnswers(saved);
      setDraftRestored(true);
    }
  }, [surveyId]);

  // Auto-save on change
  useEffect(() => {
    if (!surveyId || Object.keys(answers).length === 0) return;
    const key = `survey_draft_${surveyId}`;
    storage.set(key, answers);
  }, [answers, surveyId]);

  const setAnswer = (questionId: string, val: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val
    }));
  };

  const clearDraft = () => {
    if (surveyId) {
      storage.remove(`survey_draft_${surveyId}`);
      setAnswers({});
      setDraftRestored(false);
    }
  };

  return {
    answers,
    setAnswer,
    clearDraft,
    draftRestored
  };
}

export default useDraftAutoSave;
