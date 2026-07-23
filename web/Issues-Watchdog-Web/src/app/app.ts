import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IssueNotificationService, LoadingService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, CommonModule, MatProgressBarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'Issues-Watchdog-Web';
  private readonly notificationService = inject(IssueNotificationService);
  protected readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    // Start polling service
    this.notificationService.start();
  }

  ngOnDestroy(): void {
    // Stop polling service
    this.notificationService.stop();
  }
}
