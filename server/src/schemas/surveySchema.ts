import { z } from 'zod';

export const collectorCategoryEnum = z.enum([
  'survey',
  'registration',
  'feedback',
  'inspection',
  'application',
  'general'
]);

export const questionTypeEnum = z.enum([
  'text',
  'long-text',
  'multiple-choice',
  'checkbox',
  'rating',
  'likert',
  'dropdown',
  'nps',
  'date',
  'number',
  'email',
  'phone'
]);

export const questionValidationSchema = z.object({
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  minSelections: z.number().int().nonnegative().optional(),
  maxSelections: z.number().int().positive().optional(),
  minRating: z.number().default(1).optional(),
  maxRating: z.number().default(5).optional()
}).optional();

export const questionInputSchema = z.object({
  _id: z.string().optional(),
  type: questionTypeEnum,
  questionText: z.string().min(1, 'Question text cannot be empty').trim(),
  description: z.string().trim().optional().default(''),
  options: z.array(z.string().trim()).optional().default([]),
  isRequired: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
  validation: questionValidationSchema
});

export const surveySettingsSchema = z.object({
  isAnonymous: z.boolean().optional().default(false),
  allowMultipleSubmissions: z.boolean().optional().default(false),
  requireAuth: z.boolean().optional().default(false),
  accessCode: z.string().optional(),
  responseLimit: z.number().int().positive().nullable().optional(),
  opensAt: z.coerce.date().nullable().optional(),
  closesAt: z.coerce.date().nullable().optional()
});

export const createSurveySchema = z.object({
  title: z.string().min(1, 'Survey title is required').max(200).trim(),
  description: z.string().min(1, 'Survey description is required').max(2000).trim(),
  category: collectorCategoryEnum.optional().default('general'),
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional().default('published'),
  settings: surveySettingsSchema.optional(),
  questions: z.array(questionInputSchema).min(1, 'Survey must include at least one question')
});

export const updateSurveySchema = createSurveySchema.partial();

export const surveyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
  category: collectorCategoryEnum.optional(),
  search: z.string().trim().optional(),
  all: z.coerce.boolean().optional()
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
export type SurveyQueryInput = z.infer<typeof surveyQuerySchema>;
