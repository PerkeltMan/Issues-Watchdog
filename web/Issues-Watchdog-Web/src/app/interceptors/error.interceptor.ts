import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Extract a human-readable message from the error response
      let message = 'Something went wrong';

      if (error.error && typeof error.error === 'object') {
        // Try to find a message field in the error response
        message = error.error.message || error.error.error || message;
      }

      // Fall back to a generic message with status code
      if (message === 'Something went wrong') {
        message = `Something went wrong (${error.status})`;
      }

      // Show the error notification
      notificationService.error(message);

      // Re-throw the error so calling code can handle it locally
      return throwError(() => error);
    })
  );
};

