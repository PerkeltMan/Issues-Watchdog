import { IssueStatus } from './issue-status';
import { SeverityLevel } from './severity-level';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
  aiSummary?: string;
  severity?: SeverityLevel;
}

