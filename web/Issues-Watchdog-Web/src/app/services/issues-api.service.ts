import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, SeverityLevel } from '../models';
import { environment } from '../../environments/environment';

interface SaveAnalysisRequest {
  aiSummary: string;
  severity: SeverityLevel;
}

@Injectable({
  providedIn: 'root',
})
export class IssuesApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl || '/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all issues from the API.
   */
  getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.apiBaseUrl}/issues`);
  }

   /**
    * Fetches a specific issue by ID.
    * @param issueId The ID of the issue.
    */
   getIssue(issueId: string): Observable<Issue> {
     return this.http.get<Issue>(`${this.apiBaseUrl}/issues/${issueId}`);
   }

   /**
    * Updates the status of a specific issue.
    * @param issueId The ID of the issue.
    * @param status The new status for the issue.
    */
   updateStatus(issueId: string, status: string): Observable<Issue> {
     return this.http.patch<Issue>(`${this.apiBaseUrl}/issues/${issueId}/status`, {
       status,
     });
   }

   /**
    * Saves the AI analysis (summary and severity) for a specific issue.
    * @param issueId The ID of the issue.
    * @param data The analysis data containing aiSummary and severity.
    */
   saveAnalysis(issueId: string, data: SaveAnalysisRequest): Observable<Issue> {
     return this.http.patch<Issue>(
       `${this.apiBaseUrl}/issues/${issueId}/analysis`,
       data
     );
   }
 }

