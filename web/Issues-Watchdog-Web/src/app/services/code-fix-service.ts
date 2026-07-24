import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from '../models/issue';

export interface CodeFixRequest {
  description: string;
}

export interface CodeFixResponse {
  oldCode: string;
  newCode: string;
  filePath: string;
  fixDescription: string;
}

export interface CommitFixRequest {
  fixedCode: string;
  filePath: string;
}

export interface CommitFixResponse {
  success: boolean;
  commitSha: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CodeFixService {
  private fixRequestWebhookUrl = 'https://issues-watchdog.onrender.com/issues/createfix';
  private commitRequestWebhookUrl = 'https://issues-watchdog.onrender.com/issues/commitfix';
  private issuesUrl = 'https://issues-watchdog.onrender.com/issues';
  constructor(private http: HttpClient) {}

  requestFix(payload: CodeFixRequest): Observable<CodeFixResponse> {
    return this.http.post<CodeFixResponse>(this.fixRequestWebhookUrl, payload);
  }

  commitFix(payload: CommitFixRequest): Observable<CommitFixResponse> {
    return this.http.post<CommitFixResponse>(this.commitRequestWebhookUrl, payload);
  }

  markIssueAsResolved(issueId: number): Observable<Issue> {
    return this.http.put<Issue>(this.issuesUrl, issueId);
  }
}
