export const API_ENDPOINTS = {
  SURVEYS: {
    BASE: '/v1/surveys',
    BY_ID: (id: string) => `/v1/surveys/${id}`,
    EXPORT: (id: string, format: 'csv' | 'json' = 'csv') => `/v1/surveys/${id}/export?format=${format}`,
    LEGACY_BASE: '/surveys',
    LEGACY_BY_ID: (id: string) => `/surveys/${id}`
  },
  RESPONSES: {
    BASE: '/v1/responses',
    CHECK_ELIGIBILITY: (surveyId: string, email: string) =>
      `/v1/responses/check-eligibility?surveyId=${encodeURIComponent(surveyId)}&email=${encodeURIComponent(email)}`,
    BY_SURVEY: (surveyId: string) => `/v1/responses/survey/${surveyId}`,
    RESULTS: (surveyId: string) => `/v1/responses/survey/${surveyId}/results`,
    LEGACY_BASE: '/responses',
    LEGACY_BY_SURVEY: (surveyId: string) => `/responses/survey/${surveyId}`,
    LEGACY_RESULTS: (surveyId: string) => `/responses/survey/${surveyId}/results`
  },
  AUTH: {
    REGISTER: '/v1/auth/register',
    LOGIN: '/v1/auth/login',
    ME: '/v1/auth/me'
  },
  SYSTEM: {
    HEALTH: '/healthz',
    API_HEALTH: '/api/healthz'
  }
} as const;

export default API_ENDPOINTS;
