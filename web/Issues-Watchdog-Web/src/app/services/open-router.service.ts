import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Issue, SeverityLevel, CodebaseFile, CodeChange } from '../models';

interface IssueSummaryResponse {
  summary: string;
  severity: SeverityLevel;
}

interface FixResponse {
  changes: CodeChange[];
  explanation: string;
}

interface OpenRouterRequestBody {
  model: string;
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  temperature?: number;
}

interface OpenRouterResponseMessage {
  role: string;
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: OpenRouterResponseMessage;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class OpenRouterService {
  // Use the API base URL from environment so it can be configured per-deploy
  private readonly apiUrl = `${environment.openRouterApiUrl.replace(/\/+$/,'')}/chat/completions`;
  private readonly maxCodebaseCharacters = 40000;

  constructor(private http: HttpClient) {}

  /**
   * Generates an analysis of the given issue (summary and severity level).
   * @param issue The issue to analyze.
   * @returns Observable with summary and severity, or error if JSON parsing fails.
   */
  generateIssueAnalysis(issue: Issue): Observable<IssueSummaryResponse> {
    const systemPrompt = `You are a code issue analyzer. Analyze the provided issue and respond with STRICT JSON only (no prose, no markdown, just raw JSON).
The JSON must have this exact shape:
{
  "summary": "A concise summary of the issue",
  "severity": "Low" | "Medium" | "High" | "Critical"
}
Do not include any text before or after the JSON object.`;

    const userPrompt = `Issue Title: ${issue.title}

Issue Description:
${issue.description}`;

    return this.callOpenRouter(systemPrompt, userPrompt).pipe(
      map((responseText) => {
        const parsed = this.parseJsonResponse<IssueSummaryResponse>(responseText);
        this.validateIssueSummary(parsed);
        return parsed;
      }),
      catchError((error) => {
        const errorMsg = `Failed to generate issue analysis: ${error.message || error}`;
        console.error(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Generates fix suggestions for the given issue, considering the codebase context.
   * @param issue The issue to fix.
   * @param codebase Array of codebase files for context.
   * @returns Observable with suggested code changes and explanation, or error if JSON parsing fails.
   */
  generateFix(issue: Issue, codebase: CodebaseFile[]): Observable<FixResponse> {
    const systemPrompt = `You are an expert code fixer. Analyze the issue and provided codebase, then respond with STRICT JSON only (no prose, no markdown, just raw JSON).
The JSON must have this exact shape:
{
  "changes": [
    {
      "filePath": "path/to/file.ts",
      "newContent": "the complete new file content"
    }
  ],
  "explanation": "A brief explanation of the changes made"
}
Do not include any text before or after the JSON object.`;

    const codebaseContext = this.buildCodebaseContext(codebase);
    const userPrompt = `Issue Title: ${issue.title}

Issue Description:
${issue.description}

Codebase Context (truncated to ~${this.maxCodebaseCharacters} characters):
${codebaseContext}

Note: In a real implementation, we should use smarter file selection (e.g., embeddings or issue-mentioned files). For now, we include a subset of the codebase.`;

    return this.callOpenRouter(systemPrompt, userPrompt).pipe(
      map((responseText) => {
        const parsed = this.parseJsonResponse<FixResponse>(responseText);
        this.validateFixResponse(parsed);
        return parsed;
      }),
      catchError((error) => {
        const errorMsg = `Failed to generate fix: ${error.message || error}`;
        console.error(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Private helper: calls OpenRouter API and returns the assistant's text content.
   */
  private callOpenRouter(systemPrompt: string, userPrompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.openRouterApiKey}`,
      'Content-Type': 'application/json',
    });

    const body: OpenRouterRequestBody = {
      model: environment.openRouterModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
    };

    return this.http.post<OpenRouterResponse>(this.apiUrl, body, { headers }).pipe(
      map((response) => this.extractMessageContent(response)),
      catchError((error) => {
        const errorMsg = `OpenRouter API error: ${error?.error?.message || error?.message || 'Unknown error'}`;
        console.error(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Private helper: extracts the assistant's text content from the OpenRouter response
   * and strips markdown code fences if present.
   */
  private extractMessageContent(response: OpenRouterResponse): string {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No choices in OpenRouter response');
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty message content from OpenRouter');
    }

    // Strip markdown code fences if present (e.g., ```json ... ```)
    return this.stripCodeFences(content);
  }

  /**
   * Private helper: strips markdown code fences from a string.
   */
  private stripCodeFences(text: string): string {
    // Remove ```json or ``` at the start and ``` at the end
    const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
    const match = text.match(codeBlockRegex);
    if (match) {
      return match[1].trim();
    }
    return text.trim();
  }

  /**
   * Private helper: parses a JSON string defensively.
   */
  private parseJsonResponse<T>(jsonText: string): T {
    try {
      return JSON.parse(jsonText) as T;
    } catch (error) {
      const parseError = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse JSON response: ${parseError}. Raw response: ${jsonText.substring(0, 200)}`);
    }
  }

  /**
   * Private helper: validates the structure of an issue summary response.
   */
  private validateIssueSummary(response: unknown): void {
    if (!response || typeof response !== 'object') {
      throw new Error('Issue summary response is not an object');
    }

    const obj = response as Record<string, unknown>;

    if (typeof obj['summary'] !== 'string' || !(obj['summary'] as string).trim()) {
      throw new Error('Issue summary response missing or invalid "summary" string');
    }

    const validSeverities: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
    if (!validSeverities.includes(obj['severity'] as SeverityLevel)) {
      throw new Error(
        `Issue summary response has invalid "severity": "${obj['severity']}". Must be one of: ${validSeverities.join(', ')}`
      );
    }
  }

  /**
   * Private helper: validates the structure of a fix response.
   */
  private validateFixResponse(response: unknown): void {
    if (!response || typeof response !== 'object') {
      throw new Error('Fix response is not an object');
    }

    const obj = response as Record<string, unknown>;

    if (!Array.isArray(obj['changes'])) {
      throw new Error('Fix response missing or invalid "changes" array');
    }

    const changes = obj['changes'] as unknown[];
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      if (typeof change !== 'object' || change === null) {
        throw new Error(`Fix response: changes[${i}] is not an object`);
      }

      const changeObj = change as Record<string, unknown>;
      if (typeof changeObj['filePath'] !== 'string' || !(changeObj['filePath'] as string).trim()) {
        throw new Error(`Fix response: changes[${i}].filePath is missing or not a string`);
      }

      if (typeof changeObj['newContent'] !== 'string') {
        throw new Error(`Fix response: changes[${i}].newContent is missing or not a string`);
      }
    }

    if (typeof obj['explanation'] !== 'string' || !(obj['explanation'] as string).trim()) {
      throw new Error('Fix response missing or invalid "explanation" string');
    }
  }

  /**
   * Private helper: builds a truncated codebase context string.
   * Note: A real implementation should use smarter file selection (embeddings, issue keywords, etc).
   */
  private buildCodebaseContext(codebase: CodebaseFile[]): string {
    let context = '';
    let totalChars = 0;

    for (const file of codebase) {
      const fileEntry = `\n--- ${file.path} ---\n${file.content}`;
      if (totalChars + fileEntry.length > this.maxCodebaseCharacters) {
        context += '\n... (codebase truncated due to character limit) ...';
        break;
      }
      context += fileEntry;
      totalChars += fileEntry.length;
    }

    return context || '(No codebase files provided)';
  }
}



