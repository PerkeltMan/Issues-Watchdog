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

    /*
    // hardcoded code fix response for testing purposes
    const fixResponse: CodeFixResponse = {
      oldCode:
        '#include "hello.h"\n\nint main()\n{\n    std::cout << "welcome, misters" << std::endl;\n\n',
      newCode:
        '#include "hello.h"\n\nint main()\n{\n    std::cout << "welcome, misters" << std::endl;\n}\n',
      filePath: 'src/main.cpp',
      fixDescription: 'closing bracket of the main function was missing',
    };

    setTimeout(() => {
      this.fixResponse.set(fixResponse);
      this.loading.set(false);
    }, 5000);
    return;
    */

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

    /*
    // hardcoded commit fix response for testing purposes
    const commitFixResponse: CommitFixResponse = {
      success: true,
      commitSha: '8890ec1676190716839f8fa5025149806814c97acf5ab8db264b1302564a4038',
      message: 'yo yo the fix was successfully committed and pushed',
    };

    setTimeout(() => {
      this.commitFixResponse.set(commitFixResponse);
      this.commitLoading.set(false);
    }, 500);
    return;
    */

    const request: CommitFixRequest = {
      fixedCode: this.fixResponse()?.newCode ?? '',
      filePath: this.fixResponse()?.filePath ?? '',
    };

    this.codeFixService.commitFix(request).subscribe({
      next: (response) => {
        this.commitFixResponse.set(response);
        this.commitLoading.set(false);

        if (this.commitFixResponse()?.success) {
          this.codeFixService.markIssueAsResolved(this.issue.id).subscribe();
        }
      },

      error: () => {
        this.commitLoading.set(false);
      },
    });
  }
}
