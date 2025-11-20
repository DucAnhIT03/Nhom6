import { BaseResponse, PaginatedResponse } from '../../common/types';

export class ResponseUtil {
  static success<T>(data: T, message = 'Success'): BaseResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, data?: any): BaseResponse {
    return {
      success: false,
      message,
      data,
    };
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

