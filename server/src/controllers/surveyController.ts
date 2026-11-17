import { Request, Response } from 'express';
import surveyService from '../services/surveyService';
import exportService from '../services/exportService';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { SurveyQueryInput } from '../schemas/surveySchema';

const isV1 = (req: Request): boolean => {
  return req.originalUrl.includes('/api/v1/');
};

// Create survey
export const createSurvey = asyncHandler(async (req: Request, res: Response) => {
  const survey = await surveyService.createSurvey(req.body, req.user);
  if (isV1(req)) {
    ApiResponse.created(res, survey, 'Survey created successfully');
  } else {
    res.status(201).json(survey);
  }
});

// Get all surveys (supports pagination, search, or legacy unpaginated list)
export const getAllSurveys = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as SurveyQueryInput;

  // If legacy endpoint, default to all surveys if pagination is not specified
  if (!isV1(req) && !req.query.page) {
    const surveys = await surveyService.getSurveys({ ...query, all: true });
    res.json(surveys);
    return;
  }

  const result = await surveyService.getSurveys(query, req.user);

  if (Array.isArray(result)) {
    if (isV1(req)) {
      ApiResponse.success(res, result);
    } else {
      res.json(result);
    }
    return;
  }

  if (isV1(req)) {
    ApiResponse.paginated(res, result.data, result.page, result.limit, result.total);
  } else {
    res.json(result.data);
  }
});

// Get single survey by ID
export const getSurveyById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const survey = await surveyService.getSurveyById(id);
  if (isV1(req)) {
    ApiResponse.success(res, survey);
  } else {
    res.json(survey);
  }
});

// Update a survey
export const updateSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const survey = await surveyService.updateSurvey(id, req.body, req.user);
  if (isV1(req)) {
    ApiResponse.success(res, survey, 'Survey updated successfully');
  } else {
    res.json(survey);
  }
});

// Delete a survey
export const deleteSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await surveyService.deleteSurvey(id, req.user);
  if (isV1(req)) {
    ApiResponse.success(res, null, 'Survey deleted successfully');
  } else {
    res.json({ message: 'Survey deleted successfully' });
  }
});

// Export survey data (CSV or JSON)
export const exportSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const format = (req.query.format as string) || 'csv';

  if (format === 'json') {
    const { filename, data } = await exportService.exportToJSON(id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(data, null, 2));
    return;
  }

  const { filename, csv } = await exportService.exportToCSV(id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});
