import { Issue } from '../models';

/**
 * Helper function to check if an issue has been analyzed.
 * An issue is considered analyzed if it has both aiSummary and severity defined.
 */
export function isIssueAnalyzed(issue: Issue): boolean {
  return issue.aiSummary !== null && issue.aiSummary !== undefined &&
         issue.severity !== null && issue.severity !== undefined;
}

