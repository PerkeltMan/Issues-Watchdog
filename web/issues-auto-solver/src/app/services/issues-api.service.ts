import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Issue, IssueStatus, SeverityLevel } from '../models';

@Injectable({
  providedIn: 'root'
})
export class IssuesApiService {
  private apiUrl = `${environment.apiBaseUrl}/issues`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all issues
   * GET {apiBaseUrl}/issues
   */
  getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.apiUrl);
  }

  /**
   * Fetch a single issue by ID
   * GET {apiBaseUrl}/issues/:id
   */
  getIssue(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/${id}`);
  }

  /**
   * Save AI analysis results for an issue
   * PATCH {apiBaseUrl}/issues/:id/analysis
   */
  saveAnalysis(
    id: string,
    data: { aiSummary: string; severity: SeverityLevel }
  ): Observable<Issue> {
    return this.http.patch<Issue>(`${this.apiUrl}/${id}/analysis`, data);
  }

  /**
   * Update the status of an issue
   * PATCH {apiBaseUrl}/issues/:id/status
   */
  updateStatus(id: string, status: IssueStatus): Observable<Issue> {
    return this.http.patch<Issue>(`${this.apiUrl}/${id}/status`, { status });
  }
}

