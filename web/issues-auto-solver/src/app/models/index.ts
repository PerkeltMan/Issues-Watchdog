/**
 * Issue Models and Interfaces
 */

export type IssueStatus = 'Open' | 'Resolved';
export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Issue {
  id: string;
  githubIssueId: number;
  title: string;
  description: string;
  status: IssueStatus;
  aiSummary: string | null;
  severity: SeverityLevel | null;
  createdAt: string;
  updatedAt: string;
}

export interface CodebaseFile {
  path: string;
  content: string;
}

export interface CodeChange {
  filePath: string;
  newContent: string;
}

export interface AutoFixPayload {
  issueId: string;
  changes: CodeChange[];
}

/**
 * Helper function to check if an issue has been analyzed
 * Returns true only if both aiSummary and severity are non-null
 */
export function isIssueAnalyzed(issue: Issue): boolean {
  return issue.aiSummary !== null && issue.severity !== null;
}

