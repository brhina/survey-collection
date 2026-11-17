import { Response } from 'express';

export interface StandardApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Created successfully'
  ): void {
    res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Records fetched successfully'
  ): void {
    const totalPages = Math.ceil(total / limit) || 1;
    res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    });
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }
}

export default ApiResponse;
