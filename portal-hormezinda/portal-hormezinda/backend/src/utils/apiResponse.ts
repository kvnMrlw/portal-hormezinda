type ApiResponseOptions = {
  success?: boolean;
  message?: string;
  error?: string;
};

export function apiResponse<TData>(
  data: TData,
  options: ApiResponseOptions = {}
): {
  success: boolean;
  message: string;
  data: TData;
  error?: string;
} {
  return {
    success: options.success ?? true,
    message: options.message ?? 'Request completed successfully',
    data,
    error: options.error
  };
}
