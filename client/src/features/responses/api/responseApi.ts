import { apiClient } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { RawResponseRecord, SurveyResultsData } from '../../../types';

export interface SubmitResponsePayload {
  surveyId: string;
  respondentEmail?: string;
  answers: { questionId: string; answer: unknown; questionType?: string }[];
  completionTimeSeconds?: number;
  accessCode?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  message: string;
  email: string;
  surveyId?: string;
}

export interface PaginatedResponsesResult {
  data: RawResponseRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const responseApi = {
  /**
   * Check if a respondent email has already submitted for this data collector.
   */
  async checkEligibility(surveyId: string, email: string): Promise<EligibilityResult> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.RESPONSES.CHECK_ELIGIBILITY(surveyId, email));
    const resData = res.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return (resData as { data: EligibilityResult }).data;
    }
    return resData as EligibilityResult;
  },

  /**
   * Submit respondent answers for a survey / data collector.
   */
  async submit(data: SubmitResponsePayload): Promise<unknown> {
    const res = await apiClient.post<unknown>(API_ENDPOINTS.RESPONSES.BASE, data);
    const resData = res.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return (resData as { data: unknown }).data;
    }
    return resData;
  },

  /**
   * Get aggregated results and analytics for a survey.
   */
  async getResults(surveyId: string): Promise<SurveyResultsData> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.RESPONSES.RESULTS(surveyId));
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: SurveyResultsData }).data;
    }
    return data as SurveyResultsData;
  },

  /**
   * Get raw respondent submission records.
   */
  async getAllResponses(surveyId: string, page = 1, limit = 50): Promise<RawResponseRecord[]> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.RESPONSES.BY_SURVEY(surveyId), {
      params: { page, limit }
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: RawResponseRecord[] }).data)) {
      return (data as { data: RawResponseRecord[] }).data;
    }
    return [];
  },

  /**
   * Get paginated respondent submission records with pagination info.
   */
  async getPaginatedResponses(surveyId: string, page = 1, limit = 20): Promise<PaginatedResponsesResult> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.RESPONSES.BY_SURVEY(surveyId), {
      params: { page, limit }
    });
    const resData = res.data as { data?: RawResponseRecord[]; pagination?: PaginatedResponsesResult['pagination'] };
    return {
      data: resData?.data || (Array.isArray(res.data) ? (res.data as RawResponseRecord[]) : []),
      pagination: resData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  }
};

export default responseApi;
