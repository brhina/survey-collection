import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  database: 'connected' | 'disconnected';
  environment: string;
}

export const systemApi = {
  /**
   * Health check endpoint to verify backend server & database connectivity.
   */
  async getHealth(): Promise<HealthCheckResponse> {
    const res = await apiClient.get<HealthCheckResponse>(API_ENDPOINTS.SYSTEM.HEALTH);
    return res.data;
  }
};

export default systemApi;
