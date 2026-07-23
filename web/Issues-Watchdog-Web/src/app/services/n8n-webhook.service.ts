import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AutoFixPayload } from '../models';

/**
 * Service for submitting auto-fix payloads to an n8n webhook.
 *
 * The n8n webhook is expected to:
 * - Receive the AutoFixPayload containing the issue ID and code changes
 * - Clone or create a branch in the target repository
 * - Apply the provided code changes to the appropriate files
 * - Commit the changes with a descriptive message
 * - Push the changes to the remote repository
 * - Create or update a pull request (if applicable)
 * - Automatically close the resolved issue in the issue tracking system
 * - Update the issue status in the application database to mark it as solved
 *
 * This service abstracts the HTTP communication with the webhook, providing
 * error handling and response normalization.
 */
@Injectable({
  providedIn: 'root',
})
export class N8nWebhookService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Submits an auto-fix payload to the n8n webhook for processing.
   *
   * @param payload - The AutoFixPayload containing the issue ID and code changes to apply
   * @returns An Observable that emits a success response object or an error
   */
  submitFix(payload: AutoFixPayload): Observable<{ success: boolean; message?: string }> {
    return this.httpClient
      .post<{ success: boolean; message?: string }>(environment.n8nWebhookUrl, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to submit fix to n8n webhook';

          if (error.error instanceof ErrorEvent) {
            // Client-side error or network error
            errorMessage = `Failed to submit fix: ${error.error.message}`;
          } else {
            // Server-side error
            errorMessage = `Failed to submit fix: ${error.status} ${error.statusText}`;
            if (error.error && typeof error.error === 'object') {
              const errorDetail = (error.error as any).message || (error.error as any).detail;
              if (errorDetail) {
                errorMessage += ` - ${errorDetail}`;
              }
            }
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}

