import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
  computed,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Issue } from '../../models';
import {
  IssuesApiService,
  OpenRouterService,
  IssueNotificationService,
  NotificationService,
} from '../../services';
import { isIssueAnalyzed } from '../../helpers/is-issue-analyzed';
import { from, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

interface IssueRow extends Issue {
  isAnalyzing?: boolean;
  analysisError?: string;
}

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss',
})
export class IssueListComponent implements OnInit, OnDestroy {
  private readonly issuesApi = inject(IssuesApiService);
  private readonly openRouter = inject(OpenRouterService);
  private readonly issueNotificationService = inject(IssueNotificationService);
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  issues: WritableSignal<IssueRow[]> = signal([]);
  isLoading = signal(true);
  isAutoAnalyzing = signal(false);

  // Computed values
  isEmpty = computed(() => !this.isLoading() && this.issues().length === 0);

  displayedColumns: string[] = [
    'title',
    'status',
    'severity',
    'aiSummary',
    'actions',
  ];

  constructor() {
    // Auto-analyze unanalyzed issues when issues are loaded
    effect(() => {
      const issuesList = this.issues();
      if (!this.isAutoAnalyzing() && issuesList.length > 0) {
        const unanalyzed = issuesList.filter((i) => !isIssueAnalyzed(i));
        if (unanalyzed.length > 0) {
          this.analyzeIssuesSequentially(unanalyzed);
        }
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to issues from the notification service
    this.issueNotificationService.issues$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((issues) => {
        this.issues.set(issues as IssueRow[]);
        this.isLoading.set(false);
      });

    // Subscribe to new issue notifications and show snackbar
    this.issueNotificationService.newIssue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newIssue) => {
        this.showNewIssueNotification(newIssue);
      });

    // Set initial loading to true
    this.isLoading.set(true);
  }

  ngOnDestroy(): void {
    // Cleanup is handled by takeUntilDestroyed
  }

  /**
   * Shows a snackbar notification for a new issue with a View action.
   */
  private showNewIssueNotification(issue: Issue): void {
    const snackBarRef = this.snackBar.open(
      `New issue detected: ${issue.title}`,
      'View',
      {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/issues', issue.id]);
    });
  }

  /**
   * Processes unanalyzed issues sequentially with a concurrency limit of 2.
   */
  private analyzeIssuesSequentially(unanalyzed: IssueRow[]): void {
    this.isAutoAnalyzing.set(true);

    from(unanalyzed)
      .pipe(
        mergeMap((issue) => this.analyzeIssue(issue), 2) // Concurrency limit of 2
      )
      .subscribe({
        complete: () => {
          this.isAutoAnalyzing.set(false);
        },
        error: (err) => {
          console.error('Error during auto-analysis:', err);
          this.notificationService.error('Auto-analysis encountered an error');
          this.isAutoAnalyzing.set(false);
        },
      });
  }

  /**
   * Analyzes a single issue and saves the result.
   */
  private analyzeIssue(issue: IssueRow): any {
    // Mark as analyzing
    this.updateIssueInList(issue.id, { isAnalyzing: true, analysisError: undefined });

    return this.openRouter.generateIssueAnalysis(issue).pipe(
      mergeMap((analysis) => {
        return this.issuesApi.saveAnalysis(issue.id, {
          aiSummary: analysis.summary,
          severity: analysis.severity,
        });
      }),
      mergeMap((updatedIssue) => {
        // Update the issue in the list with analysis results
        this.updateIssueInList(updatedIssue.id, {
          aiSummary: updatedIssue.aiSummary,
          severity: updatedIssue.severity,
          isAnalyzing: false,
        });
        return of(null);
      }),
      catchError((err) => {
        console.error(`Failed to analyze issue ${issue.id}:`, err);
        // Update with error state but don't stop processing others
        this.updateIssueInList(issue.id, {
          isAnalyzing: false,
          analysisError: 'Analysis failed',
        });
        // Show error notification for this specific issue
        this.notificationService.error(
          `Failed to analyze issue: ${issue.title}`
        );
        return of(null);
      })
    );
  }

  /**
   * Updates a specific issue in the issues list.
   */
  private updateIssueInList(
    issueId: string,
    updates: Partial<IssueRow>
  ): void {
    const currentIssues = this.issues();
    const index = currentIssues.findIndex((i) => i.id === issueId);
    if (index !== -1) {
      const updated = [...currentIssues];
      updated[index] = { ...updated[index], ...updates };
      this.issues.set(updated);
    }
  }

  /**
   * Returns the color for a severity chip.
   */
  getSeverityColor(severity?: string): string {
    switch (severity) {
      case 'Low':
        return 'accent';
      case 'Medium':
        return 'info';
      case 'High':
        return 'warn';
      case 'Critical':
        return 'danger';
      default:
        return 'basic';
    }
  }

  /**
   * Returns the color for a status chip.
   */
  getStatusColor(status: string): string {
    return status === 'Resolved' ? 'accent' : 'warn';
  }

  /**
   * Refreshes the issues list by triggering an immediate poll.
   */
  refresh(): void {
    this.issueNotificationService.refreshNow();
  }

  /**
   * TrackBy function for mat-table to optimize rendering.
   */
  trackByIssueId(_index: number, issue: IssueRow): string {
    return issue.id;
  }
}






