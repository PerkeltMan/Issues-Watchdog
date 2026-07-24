import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CodeFixRequest {
  issueDescription: string;
}

export interface CodeFixResponse {
  FixSummary: string;
  OldCode: string;
  FixedCode: string;
  FilePath: string;
}

export interface CommitFixRequest {
  fixedCode: string;
  filePath: string;
}

export interface CommitFixResponse {
  
}

@Injectable({
  providedIn: 'root',
})
export class CodeFixService {
  // Replace with your active n8n Webhook Production URL
  private fixRequestWebhookUrl = 'https://issues-watchdog.onrender.com/issues/createfix';
  private commitRequestWebhookUrl = '';
  constructor(private http: HttpClient) {}

  requestFix(payload: CodeFixRequest): Observable<CodeFixResponse> {
    return this.http.post<CodeFixResponse>(this.fixRequestWebhookUrl, payload);
  }

  commitFix(payload: CommitFixRequest): Observable<CommitFixResponse> {
    return this.http.post<CommitFixResponse>(this.commitRequestWebhookUrl, payload);
  }
}
