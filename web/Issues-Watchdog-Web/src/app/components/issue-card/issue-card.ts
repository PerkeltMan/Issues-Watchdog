import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Issue } from '../../models/issue';
import { CodeFixRequest, CodeFixResponse, CodeFixService, CommitFixRequest, CommitFixResponse } from '../../services/code-fix-service';

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

  loading = false;

  fixResponse?: CodeFixResponse;
  commitFixResponse?: CommitFixResponse;

  generateFix(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;

    const request: CodeFixRequest = {
      issueDescription: this.issue.description,
    };

    this.codeFixService.requestFix(request).subscribe({
      next: (response) => {
        this.commitFixResponse = response;
      },

      error: () => {
        this.loading = false;
      },
    });
  }

  applyFix(): void {

    const request: CommitFixRequest = {
      fixedCode: this.fixResponse?.FixedCode ?? "",
      filePath: this.fixResponse?.FilePath ?? ""
    };

        this.codeFixService.commitFix(request).subscribe({
          next: (response) => {
            this.fixResponse = response;
            this.loading = false;
          }
        }
  }

}
