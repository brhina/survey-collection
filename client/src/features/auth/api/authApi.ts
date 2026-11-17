import { apiClient } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { AuthResponseData, AuthUser, LoginCredentials, RegisterCredentials } from '../types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const res = await apiClient.post<unknown>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: AuthResponseData }).data;
    }
    return data as AuthResponseData;
  },

  async register(data: RegisterCredentials): Promise<AuthResponseData> {
    const res = await apiClient.post<unknown>(API_ENDPOINTS.AUTH.REGISTER, data);
    const resData = res.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return (resData as { data: AuthResponseData }).data;
    }
    return resData as AuthResponseData;
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.AUTH.ME);
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: AuthUser }).data;
    }
    return data as AuthUser;
  }
};

export default authApi;
