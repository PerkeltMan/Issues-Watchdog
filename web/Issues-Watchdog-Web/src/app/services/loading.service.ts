import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requestCounter = signal(0);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits true when loading, false when idle.
   */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {
    // Sync the signal with the observable
    effect(() => {
      const count = this.requestCounter();
      this.isLoadingSubject.next(count > 0);
    });
  }

  /**
   * Getter for the current loading state (useful for template *ngIf checks)
   */
  getIsLoading(): boolean {
    return this.requestCounter() > 0;
  }

  /**
   * Increments the request counter to indicate loading has started
   */
  show(): void {
    this.requestCounter.update((count) => count + 1);
  }

  /**
   * Decrements the request counter to indicate loading has completed
   */
  hide(): void {
    const currentCount = this.requestCounter();
    if (currentCount > 0) {
      this.requestCounter.update((count) => count - 1);
    }
  }

  /**
   * Resets the counter to zero (useful for cleanup)
   */
  reset(): void {
    this.requestCounter.set(0);
  }
}


