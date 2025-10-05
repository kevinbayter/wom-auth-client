import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '@shared/models';

/**
 * Functional HTTP Interceptor for global error handling (Angular 18 style)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = getServerErrorMessage(error);
      }

      return throwError(() => ({
        ...error,
        userMessage: errorMessage
      }));
    })
  );
};

function getServerErrorMessage(error: HttpErrorResponse): string {
  const errorResponse = error.error as ErrorResponse;

  switch (error.status) {
    case 400:
      return errorResponse?.message || 'Invalid request. Please check your input.';
    case 401:
      return errorResponse?.message || 'Invalid credentials or session expired.';
    case 403:
      return errorResponse?.message || 'Access forbidden. Your account may be locked.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return errorResponse?.message || `Error: ${error.statusText}`;
  }
}
