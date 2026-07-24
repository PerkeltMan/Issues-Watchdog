import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Issue } from '../../models/issue';
import {
  CodeFixRequest,
  CodeFixResponse,
  CodeFixService,
  CommitFixRequest,
  CommitFixResponse,
} from '../../services/code-fix-service';

@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-card.html',
  styleUrls: ['./issue-card.scss'],
})
export class IssueCard {
  @Input({ required: true })
  issue!: Issue;

  private codeFixService = inject(CodeFixService);

  loading = signal(false);
  commitLoading = signal(false);

  fixResponse = signal<CodeFixResponse | undefined>(undefined);
  commitFixResponse = signal<CommitFixResponse | undefined>(undefined);

  generateFix(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);

    const request: CodeFixRequest = {
      description: this.issue.description,
    };

    this.codeFixService.requestFix(request).subscribe({
      next: (response) => {
        this.fixResponse.set(response);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
      },
    });
  }

  applyFix(): void {
    if (this.commitLoading()) {
      return;
    }

    this.commitLoading.set(true);

    const request: CommitFixRequest = {
      fixedCode: this.fixResponse()?.newCode ?? '',
      filePath: this.fixResponse()?.filePath ?? '',
    };

    this.codeFixService.commitFix(request).subscribe({
      next: (response) => {
        this.commitFixResponse.set(response);
        this.commitLoading.set(false);

        if (this.commitFixResponse()?.success)
        {
          this.codeFixService.markIssueAsResolved(this.issue.id).subscribe();
        }
      },

      error: () => {
        this.commitLoading.set(false);
      },
    });
  }
}
