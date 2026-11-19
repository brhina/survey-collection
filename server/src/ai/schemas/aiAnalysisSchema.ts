import { z } from 'zod';

export const AiRiskFactorSchema = z.object({
  risk: z.string().describe('Identified risk or operational bottleneck'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  likelihood: z.enum(['UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']),
  mitigation: z.string().describe('Recommended action to neutralize or reduce the risk')
});

export const AiCitationSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  metricValue: z.string().describe('e.g., "78% Negative" or "Average 1.8/5" or "12 reports"'),
  sampleQuotes: z.array(z.string()).max(5).describe('Direct anonymized respondent quotes illustrating the pattern')
});

export const AiRoadmapItemSchema = z.object({
  priority: z.enum(['P0_IMMEDIATE', 'P1_HIGH', 'P2_MEDIUM', 'P3_LOW']),
  actionItem: z.string(),
  suggestedOwnerRole: z.string().describe('e.g., "Safety Officer", "Program Director", "Lead QA"'),
  timeframe: z.string().describe('e.g., "Within 24 hours", "Next Sprint", "Q2 Roadmap"')
});

export const AiVerdictSchema = z.object({
  decision: z.string().describe('The primary operational verdict (e.g., PASSED, CONDITIONAL_PASS, CRITICAL_HAZARD_FAIL, ADMIT, REJECT)'),
  statusBadge: z.enum(['SUCCESS', 'WARNING', 'DANGER', 'INFO']),
  confidenceScore: z.number().min(0).max(100).describe('Bayesian-weighted confidence percentage (0-100)'),
  verdictHeadline: z.string().describe('Punchy, decisive 1-sentence decision statement'),
  coreJustification: z.string().describe('Detailed chain-of-thought grounding the verdict in the collected evidence')
});

export const AiCollectorAnalysisSchema = z.object({
  executiveSummary: z.string().describe('Comprehensive 3-5 sentence leadership briefing summarizing findings'),
  category: z.string(),
  verdict: AiVerdictSchema,
  keyThemes: z.array(z.object({
    theme: z.string(),
    sentiment: z.enum(['VERY_POSITIVE', 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'VERY_NEGATIVE']),
    percentageAffected: z.number().min(0).max(100),
    summary: z.string()
  })),
  citations: z.array(AiCitationSchema),
  risks: z.array(AiRiskFactorSchema),
  actionableRoadmap: z.array(AiRoadmapItemSchema),
  dataIntegrityNotes: z.string().optional().describe('Notes on sample size, statistical significance, potential response bias, or data limitations')
});

export const DecisionOverrideSchema = z.object({
  newDecision: z.string().min(2, 'Decision must be at least 2 characters'),
  statusBadge: z.enum(['SUCCESS', 'WARNING', 'DANGER', 'INFO']).default('INFO'),
  overrideReason: z.string().min(10, 'A detailed override reason of at least 10 characters is required for audit governance')
});

export const AiChatQuerySchema = z.object({
  question: z.string().min(2, 'Question must be at least 2 characters'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional().default([])
});

export type IAiRiskFactor = z.infer<typeof AiRiskFactorSchema>;
export type IAiCitation = z.infer<typeof AiCitationSchema>;
export type IAiRoadmapItem = z.infer<typeof AiRoadmapItemSchema>;
export type IAiVerdict = z.infer<typeof AiVerdictSchema>;
export type IAiCollectorAnalysis = z.infer<typeof AiCollectorAnalysisSchema>;
export type DecisionOverrideInput = z.infer<typeof DecisionOverrideSchema>;
export type AiChatQueryInput = z.infer<typeof AiChatQuerySchema>;
