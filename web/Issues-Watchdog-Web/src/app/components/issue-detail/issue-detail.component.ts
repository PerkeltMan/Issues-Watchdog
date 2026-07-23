import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Issue, AutoFixPayload } from '../../models';
import {
  IssuesApiService,
  CodebaseApiService,
  OpenRouterService,
  N8nWebhookService,
  NotificationService,
} from '../../services';
import { AutoFixPreviewDialogComponent } from '../auto-fix-preview-dialog/auto-fix-preview-dialog.component';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.scss',
})
export class IssueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private issuesApi = inject(IssuesApiService);
  private codebaseApi = inject(CodebaseApiService);
  private openRouter = inject(OpenRouterService);
  private n8nWebhook = inject(N8nWebhookService);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  // State signals
  issue = signal<Issue | null>(null);
  isLoading = signal(true);
  isNotFound = signal(false);
  isGeneratingFix = signal(false);
  isSubmittingFix = signal(false);

  ngOnInit(): void {
    const issueId = this.route.snapshot.paramMap.get('id');

    if (!issueId) {
      this.isNotFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.issuesApi
      .getIssue(issueId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.error('Failed to load issue:', error);
          this.isNotFound.set(true);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((issue) => {
        if (issue) {
          this.issue.set(issue);
        }
      });
  }

  /**
   * Returns the color for a severity chip
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
   * Returns the color for a status chip
   */
  getStatusColor(status: string): string {
    return status === 'Resolved' ? 'accent' : 'warn';
  }

  /**
   * Checks if the issue is resolved
   */
  isResolved(): boolean {
    return this.issue()?.status === 'Resolved';
  }

  /**
   * Generates a fix for the issue
   */
  generateFix(): void {
    const currentIssue = this.issue();
    if (!currentIssue) return;

    this.isGeneratingFix.set(true);

    // Step 1: Fetch codebase snapshot
    this.codebaseApi
      .getCodebaseSnapshot()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.error('Failed to get codebase snapshot:', error);
          this.notificationService.error(
            `Failed to generate fix: ${error.message || 'Unknown error'}`
          );
          this.isGeneratingFix.set(false);
          return of(null);
        })
      )
      .subscribe((codebaseFiles) => {
        if (!codebaseFiles) return;

        // Step 2: Generate fix using OpenRouter
        this.openRouter
          .generateFix(currentIssue, codebaseFiles)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => {
              console.error('Failed to generate fix:', error);
              this.notificationService.error(
                `Failed to generate fix: ${error.message || 'Unknown error'}`
              );
              this.isGeneratingFix.set(false);
              return of(null);
            })
          )
          .subscribe((fixResponse) => {
            this.isGeneratingFix.set(false);

            if (!fixResponse) return;

            // Step 3: Open preview dialog
            this.openPreviewDialog(fixResponse.explanation, fixResponse.changes);
          });
      });
  }

  /**
   * Opens the fix preview dialog
   */
  private openPreviewDialog(explanation: string, changes: any[]): void {
    const dialogRef = this.dialog.open(AutoFixPreviewDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    });

    const instance = dialogRef.componentInstance;
    instance.explanation = explanation;
    instance.changes = changes;

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && result.accepted) {
          this.submitFix(result.changes);
        }
      });
  }

  /**
   * Submits the fix to n8n webhook
   */
  private submitFix(changes: any[]): void {
    const currentIssue = this.issue();
    if (!currentIssue) return;

    this.isSubmittingFix.set(true);

    const payload: AutoFixPayload = {
      issueId: currentIssue.id,
      changes: changes,
    };

    this.n8nWebhook
      .submitFix(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmittingFix.set(false))
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Fix submitted — n8n is applying it now.'
          );
          // Optionally navigate back to issues list
          // this.router.navigate(['/']);
        },
        error: (error) => {
          this.notificationService.error(
            `Failed to submit fix: ${error.message || 'Unknown error'}`
          );
        },
      });
  }

  /**
   * Navigates back to the issues list
   */
  backToIssues(): void {
    this.router.navigate(['/']);
  }
}



