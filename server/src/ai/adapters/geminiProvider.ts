import { ILlmProvider, ProviderGenerateOptions } from './llmProvider.interface';
import { PreparedCollectorContext } from '../pipeline/contextBuilder';
import {
  IAiCollectorAnalysis,
  AiCollectorAnalysisSchema
} from '../schemas/aiAnalysisSchema';
import { MASTER_SYSTEM_PROMPT, CHAT_DATA_SYSTEM_PROMPT } from '../prompts/systemPrompts';
import { env } from '../../config/env';

export class GeminiProvider implements ILlmProvider {
  public readonly name = 'gemini';
  private apiKey: string;
  public model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || env.GEMINI_API_KEY || '';
    this.model = model || env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Returns an ordered list of candidate models for automatic failover.
   */
  private getCandidateModels(): string[] {
    const list = [this.model, 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    return Array.from(new Set(list.filter(Boolean)));
  }

  public async generateAnalysis(
    context: PreparedCollectorContext,
    options?: ProviderGenerateOptions
  ): Promise<{
    analysis: IAiCollectorAnalysis;
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured.');
    }

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

    const candidateModels = this.getCandidateModels();
    let lastError: Error | null = null;

    for (const modelToTry of candidateModels) {
      options?.onStreamPhase?.('CONNECTING_PROVIDER', `Contacting Google Gemini (${modelToTry})...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${this.apiKey}`;

      const requestPayload = {
        systemInstruction: {
          parts: [{ text: MASTER_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: options?.temperature ?? env.AI_TEMPERATURE,
          responseMimeType: 'application/json'
        }
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If high demand (503) or rate-limit (429), try next candidate model
          if ([503, 429].includes(response.status) && modelToTry !== candidateModels[candidateModels.length - 1]) {
            console.warn(`[Gemini] ${modelToTry} returned HTTP ${response.status}. Trying fallback model...`);
            continue;
          }
          throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
        }

        const json = (await response.json()) as any;
        const candidate = json.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Gemini returned an empty response.');
        }

        const parsedJson = JSON.parse(rawText);
        const validated = AiCollectorAnalysisSchema.parse(parsedJson);

        const tokenUsage = {
          promptTokens: json.usageMetadata?.promptTokenCount || 500,
          completionTokens: json.usageMetadata?.candidatesTokenCount || 400,
          totalTokens: json.usageMetadata?.totalTokenCount || 900
        };

        this.model = modelToTry;
        return {
          analysis: validated,
          tokenUsage
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Attempt on ${modelToTry} failed: ${err.message}`);
      }
    }

    throw lastError || new Error('All Gemini model candidates failed.');
  }

  public async chatWithData(
    context: PreparedCollectorContext,
    userQuestion: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured.');
    }

    const candidateModels = this.getCandidateModels();
    let lastError: Error | null = null;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Here is the dataset context for "${context.title}":\n\n${context.formattedTextContext}`
          }
        ]
      },
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts: [{ text: userQuestion }]
      }
    ];

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: CHAT_DATA_SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.2
      }
    };

    for (const modelToTry of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${this.apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If high demand (503) or rate-limit (429), try next candidate model
          if ([503, 429].includes(response.status) && modelToTry !== candidateModels[candidateModels.length - 1]) {
            console.warn(`[Gemini Chat] ${modelToTry} returned HTTP ${response.status}. Trying fallback model...`);
            continue;
          }
          throw new Error(`Gemini Chat error [${response.status}]: ${errorText}`);
        }

        const json = (await response.json()) as any;
        this.model = modelToTry;
        return json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Chat] Attempt on ${modelToTry} failed: ${err.message}`);
      }
    }

    throw lastError || new Error('All Gemini model candidates failed.');
  }
}

export default GeminiProvider;
