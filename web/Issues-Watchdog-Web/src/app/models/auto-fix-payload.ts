import { CodeChange } from './code-change';

export interface AutoFixPayload {
  issueId: string;
  changes: CodeChange[];
}

