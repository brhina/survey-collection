import { ILlmProvider, ProviderGenerateOptions } from './llmProvider.interface';
import { PreparedCollectorContext } from '../pipeline/contextBuilder';
import {
  IAiCollectorAnalysis,
  AiCollectorAnalysisSchema
} from '../schemas/aiAnalysisSchema';
import { MASTER_SYSTEM_PROMPT, CHAT_DATA_SYSTEM_PROMPT } from '../prompts/systemPrompts';
import { env } from '../../config/env';

export class OpenAiProvider implements ILlmProvider {
  public readonly name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || env.OPENAI_API_KEY || '';
    this.model = model || env.OPENAI_MODEL || 'gpt-4o';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateAnalysis(
    context: PreparedCollectorContext,
    options?: ProviderGenerateOptions
  ): Promise<{
    analysis: IAiCollectorAnalysis;
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key is not configured.');
    }

    options?.onStreamPhase?.('CONNECTING_PROVIDER', `Contacting OpenAI (${this.model})...`);

    const rubricInstruction = options?.categoryRubric ? `\n\n${options.categoryRubric}\n` : '';
    const userPrompt = `
Analyze the following Data Collector dataset. Synthesize an executive leadership summary, evaluate category-specific rubrics, determine an objective operational decision, identify key themes, citations, risks, and an actionable roadmap.

${rubricInstruction}

${context.formattedTextContext}

Return ONLY valid JSON matching this schema:
{
  "executiveSummary": string,
  "category": string,
  "verdict": {
    "decision": string,
    "statusBadge": "SUCCESS" | "WARNING" | "DANGER" | "INFO",
    "confidenceScore": number (20-98),
    "verdictHeadline": string,
    "coreJustification": string
  },
  "keyThemes": [
    { "theme": string, "sentiment": "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE", "percentageAffected": number, "summary": string }
  ],
  "citations": [
    { "questionId": string, "questionText": string, "metricValue": string, "sampleQuotes": string[] }
  ],
  "risks": [
    { "risk": string, "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", "likelihood": "UNLIKELY" | "POSSIBLE" | "LIKELY" | "ALMOST_CERTAIN", "mitigation": string }
  ],
  "actionableRoadmap": [
    { "priority": "P0_IMMEDIATE" | "P1_HIGH" | "P2_MEDIUM" | "P3_LOW", "actionItem": string, "suggestedOwnerRole": string, "timeframe": string }
  ],
  "dataIntegrityNotes": string (optional)
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: MASTER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: options?.temperature ?? env.AI_TEMPERATURE,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errText}`);
    }

    const json = (await response.json()) as any;
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI returned an empty completion.');
    }

    const parsedJson = JSON.parse(content);
    const validated = AiCollectorAnalysisSchema.parse(parsedJson);

    return {
      analysis: validated,
      tokenUsage: {
        promptTokens: json.usage?.prompt_tokens || 500,
        completionTokens: json.usage?.completion_tokens || 400,
        totalTokens: json.usage?.total_tokens || 900
      }
    };
  }

  public async chatWithData(
    context: PreparedCollectorContext,
    userQuestion: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key is not configured.');
    }

    const messages = [
      { role: 'system', content: CHAT_DATA_SYSTEM_PROMPT },
      {
        role: 'system',
        content: `DATASET CONTEXT:\n${context.formattedTextContext}`
      },
      ...history,
      { role: 'user', content: userQuestion }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Chat error [${response.status}]: ${errText}`);
    }

    const json = (await response.json()) as any;
    return json.choices?.[0]?.message?.content || 'No response generated.';
  }
}

export default OpenAiProvider;
