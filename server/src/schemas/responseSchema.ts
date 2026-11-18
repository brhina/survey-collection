import { z } from 'zod';
import { questionTypeEnum } from './surveySchema';

export const answerInputSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  questionType: questionTypeEnum.optional(),
  answer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string())
  ])
});

export const submitResponseSchema = z.object({
  surveyId: z.string().min(1, 'Survey ID is required'),
  respondentEmail: z.string().email('Valid email address is required').trim().toLowerCase().optional(),
  answers: z.array(answerInputSchema).min(1, 'At least one answer must be provided'),
  completionTimeSeconds: z.number().int().nonnegative().optional().default(0),
  accessCode: z.string().optional()
});

export const checkEligibilityQuerySchema = z.object({
  surveyId: z.string().min(1, 'Survey / Collector ID is required'),
  email: z.string().email('Valid email address is required').trim().toLowerCase()
});

export const responseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type CheckEligibilityQueryInput = z.infer<typeof checkEligibilityQuerySchema>;
export type ResponseQueryInput = z.infer<typeof responseQuerySchema>;
