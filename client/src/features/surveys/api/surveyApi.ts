import { apiClient } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { CreateSurveyData, Survey } from '../../../types';

export interface SurveyQueryParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'closed' | 'archived';
  category?: string;
  search?: string;
  all?: boolean;
}

export interface PaginatedSurveysResponse {
  data: Survey[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const surveyApi = {
  /**
   * Fetch all surveys with optional filters. By default fetches all records (all: true).
   */
  async getAll(params?: SurveyQueryParams): Promise<Survey[]> {
    const queryParams = { all: true, ...params };
    const res = await apiClient.get<unknown>(API_ENDPOINTS.SURVEYS.BASE, { params: queryParams });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: Survey[] }).data)) {
      return (data as { data: Survey[] }).data;
    }
    return [];
  },

  /**
   * Fetch paginated list of surveys with pagination metadata.
   */
  async getPaginated(params?: SurveyQueryParams): Promise<PaginatedSurveysResponse> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.SURVEYS.BASE, { params });
    const resData = res.data as { data?: Survey[]; pagination?: PaginatedSurveysResponse['pagination'] };
    return {
      data: resData?.data || (Array.isArray(res.data) ? (res.data as Survey[]) : []),
      pagination: resData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  },

  /**
   * Fetch a single survey by ID.
   */
  async getById(id: string): Promise<Survey> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.SURVEYS.BY_ID(id));
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: Survey }).data;
    }
    return data as Survey;
  },

  /**
   * Create a new survey.
   */
  async create(data: CreateSurveyData): Promise<Survey> {
    const res = await apiClient.post<unknown>(API_ENDPOINTS.SURVEYS.BASE, data);
    const resData = res.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return (resData as { data: Survey }).data;
    }
    return resData as Survey;
  },

  /**
   * Update an existing survey by ID.
   */
  async update(id: string, data: Partial<CreateSurveyData>): Promise<Survey> {
    const res = await apiClient.put<unknown>(API_ENDPOINTS.SURVEYS.BY_ID(id), data);
    const resData = res.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return (resData as { data: Survey }).data;
    }
    return resData as Survey;
  },

  /**
   * Fast status update for a survey (e.g. publish, close, draft, archive).
   */
  async updateStatus(id: string, status: 'draft' | 'published' | 'closed' | 'archived'): Promise<Survey> {
    const res = await apiClient.patch<unknown>(`${API_ENDPOINTS.SURVEYS.BY_ID(id)}/status`, { status });
    const resData = res.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return (resData as { data: Survey }).data;
    }
    return resData as Survey;
  },

  /**
   * Soft-delete or archive a survey by ID.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SURVEYS.BY_ID(id));
  },

  /**
   * Get direct URL to export survey responses.
   */
  getExportUrl(id: string, format: 'csv' | 'json' = 'csv'): string {
    const base = apiClient.defaults.baseURL || 'http://localhost:5000/api';
    return `${base}${API_ENDPOINTS.SURVEYS.EXPORT(id, format)}`;
  },

  /**
   * Programmatically download export file with authorization headers and automatic save dialog.
   */
  async downloadExport(id: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    const res = await apiClient.get(API_ENDPOINTS.SURVEYS.EXPORT(id, format), {
      responseType: format === 'json' ? 'json' : 'blob'
    });
    const blob =
      format === 'json'
        ? new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        : (res.data as Blob);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey-${id}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default surveyApi;
