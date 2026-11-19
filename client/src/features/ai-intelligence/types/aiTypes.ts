export type VerdictStatusBadge = 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';

export type SentimentType =
  | 'VERY_POSITIVE'
  | 'POSITIVE'
  | 'NEUTRAL'
  | 'NEGATIVE'
  | 'VERY_NEGATIVE';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLikelihood = 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';

export type RoadmapPriority =
  | 'P0_IMMEDIATE'
  | 'P1_HIGH'
  | 'P2_MEDIUM'
  | 'P3_LOW';

export interface AiVerdict {
  decision: string;
  statusBadge: VerdictStatusBadge;
  confidenceScore: number;
  verdictHeadline: string;
  coreJustification: string;
}

export interface AiTheme {
  theme: string;
  sentiment: SentimentType;
  percentageAffected: number;
  summary: string;
}

export interface AiCitation {
  questionId: string;
  questionText: string;
  metricValue: string;
  sampleQuotes: string[];
}

export interface AiRiskFactor {
  risk: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  mitigation: string;
}

export interface AiRoadmapItem {
  priority: RoadmapPriority;
  actionItem: string;
  suggestedOwnerRole: string;
  timeframe: string;
}

export interface AiCollectorAnalysis {
  executiveSummary: string;
  category: string;
  verdict: AiVerdict;
  keyThemes: AiTheme[];
  citations: AiCitation[];
  risks: AiRiskFactor[];
  actionableRoadmap: AiRoadmapItem[];
  dataIntegrityNotes?: string;
}

export interface HumanOverrideRecord {
  overriddenBy?: string | { _id?: string; name?: string; email?: string };
  originalDecision: string;
  newDecision: string;
  overrideReason: string;
  overriddenAt: string;
}

export interface AiAnalysisRecord {
  id?: string;
  _id?: string;
  surveyId: string;
  collectorCategory?: string;
  responseCountAtAnalysis?: number;
  cached?: boolean;
  modelName: string;
  provider: string;
  analysis: AiCollectorAnalysis;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  humanOverride?: HumanOverrideRecord;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecisionOverridePayload {
  newDecision: string;
  statusBadge: VerdictStatusBadge;
  overrideReason: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StreamPhaseEvent {
  phase: string;
  message: string;
}
