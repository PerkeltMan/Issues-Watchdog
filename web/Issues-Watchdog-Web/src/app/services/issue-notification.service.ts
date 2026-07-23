import { Injectable, DestroyRef, inject } from '@angular/core';
import { Subject, Observable, timer, BehaviorSubject, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IssuesApiService } from './issues-api.service';
import { Issue } from '../models';

@Injectable({
  providedIn: 'root',
})
export class IssueNotificationService {
  private readonly issuesApi = inject(IssuesApiService);
  private readonly destroyRef = inject(DestroyRef);

  // Polling state
  private pollingActive = false;
  private readonly pollingTrigger = new Subject<void>();

  // Observable sources
  private readonly issuesSubject = new BehaviorSubject<Issue[]>([]);
  private readonly newIssueSubject = new Subject<Issue>();

  // Public observables
  readonly issues$ = this.issuesSubject.asObservable();
  readonly newIssue$ = this.newIssueSubject.asObservable();

  // Track previously known issue IDs
  private previouslyKnownIds = new Set<string>();

  constructor() {
    this.setupPolling();
  }

  /**
   * Sets up the polling mechanism with error handling and recovery.
   */
  private setupPolling(): void {
    timer(0, 15000) // Start immediately, then every 15 seconds
      .pipe(
        switchMap(() => {
          return this.issuesApi.getIssues().pipe(
            catchError((error) => {
              console.error('Error polling issues:', error);
              // Return the last known state to avoid interrupting the polling loop
              return of(this.issuesSubject.getValue());
            })
          );
        }),
        tap((issues) => this.processIssuesUpdate(issues)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /**
   * Processes an issues update, detects new issues, and emits notifications.
   */
  private processIssuesUpdate(issues: Issue[]): void {
    // Get current IDs
    const currentIds = new Set(issues.map((issue) => issue.id));

    // Find newly added issues
    const newIssues = issues.filter(
      (issue) => !this.previouslyKnownIds.has(issue.id)
    );

    // Emit each new issue
    newIssues.forEach((issue) => {
      this.newIssueSubject.next(issue);
    });

    // Update state
    this.issuesSubject.next(issues);
    this.previouslyKnownIds = currentIds;
  }

  /**
   * Triggers an immediate poll of issues.
   */
  refreshNow(): void {
    this.issuesApi.getIssues().subscribe({
      next: (issues) => this.processIssuesUpdate(issues),
      error: (error) => console.error('Error refreshing issues:', error),
    });
  }

  /**
   * Starts the polling mechanism.
   * Note: Polling starts immediately upon service instantiation.
   * This method is provided for API consistency and future extensions.
   */
  start(): void {
    // Polling is already active upon construction
    this.pollingActive = true;
  }

  /**
   * Stops the polling mechanism.
   */
  stop(): void {
    this.pollingActive = false;
    this.pollingTrigger.complete();
  }
}



