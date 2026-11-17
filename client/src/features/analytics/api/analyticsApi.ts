import { responseApi } from '../../responses/api/responseApi';
import { surveyApi } from '../../surveys/api/surveyApi';

export const analyticsApi = {
  getSurveyResults: responseApi.getResults,
  getAllResponses: responseApi.getAllResponses,
  getPaginatedResponses: responseApi.getPaginatedResponses,
  getExportUrl: surveyApi.getExportUrl,
  downloadExport: surveyApi.downloadExport
};

export default analyticsApi;
