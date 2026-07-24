export interface Issue {
  id: number;
  repositoryId: number;
  severity: string; // "low", "medium", "high" or "critical"
  description: string; // AI description
  resolved: boolean;
  githubId: number;
  title: string;
}
