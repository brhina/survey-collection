import { Request, Response } from 'express';
import responseService from '../services/responseService';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const isV1 = (req: Request): boolean => {
  return req.originalUrl.includes('/api/v1/');
};

// Check if an email is eligible to submit (1-submission-per-email policy)
export const checkEligibility = asyncHandler(async (req: Request, res: Response) => {
  const surveyId = String(req.query.surveyId || '');
  const email = String(req.query.email || (req.user ? req.user.email : ''));

  const result = await responseService.checkEligibility(surveyId, email);

  if (isV1(req)) {
    ApiResponse.success(res, result, result.message);
  } else {
    res.json(result);
  }
});

// Submit a new survey / data collector response
export const submitResponse = asyncHandler(async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const response = await responseService.submitResponse(
    req.body,
    req.user,
    clientIp,
    userAgent
  );

  if (isV1(req)) {
    ApiResponse.created(res, response, 'Survey response submitted successfully');
  } else {
    res.status(201).json(response);
  }
});

// Get aggregated survey results (using MongoDB aggregation pipeline)
export const getSurveyResults = asyncHandler(async (req: Request, res: Response) => {
  const surveyId = String(req.params.surveyId);
  const results = await responseService.getSurveyResults(surveyId);

  if (isV1(req)) {
    ApiResponse.success(res, results);
  } else {
    res.json(results);
  }
});

// Get raw responses for a survey (supports pagination)
export const getAllResponses = asyncHandler(async (req: Request, res: Response) => {
  const surveyId = String(req.params.surveyId);
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const paginated = await responseService.getSurveyResponses(surveyId, page, limit);

  if (isV1(req)) {
    ApiResponse.paginated(res, paginated.data, paginated.page, paginated.limit, paginated.total);
  } else {
    res.json(paginated.data);
  }
});
