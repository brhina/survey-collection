import { Request, Response } from 'express';
import authService from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { UnauthorizedError } from '../errors';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, result, 'User registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, result, 'Logged in successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const user = await authService.getCurrentUser(req.user.id);
  ApiResponse.success(res, user, 'User profile fetched successfully');
});
