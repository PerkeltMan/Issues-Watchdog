import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Issue } from '../../models/issue';
import { IssuesService } from '../../services/issues-service';
import { CommonModule } from '@angular/common';
import { IssueCard } from '../../components/issue-card/issue-card';

@Component({
  selector: 'app-issues-page',
  standalone: true,
  imports: [CommonModule, IssueCard],
  templateUrl: './issues-page.html',
  styleUrls: ['./issues-page.scss'],
})
export class IssuesPage implements OnInit {
  issues: Issue[] = [];

  private issuesService = inject(IssuesService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.issuesService.getIssues().subscribe((issues) => {
      this.issues = issues;
      this.cdr.detectChanges();
    });

    /*
    // hardcoded issues for testing purposes
    const issue1: Issue = { id: 67, description: 'this bug breaks the whole application, it lies in the Main() function', githubId: 37, repositoryId: 8, resolved: false, severity: 'high', title: 'terrible bug' };
    const issue2: Issue = { id: 68, description: "nothing groundbreaking - a button doesn't register user's click sometimes", githubId: 37, repositoryId: 8, resolved: false, severity: 'low', title: 'minor bug' };
    this.issues.push(issue1);
    this.issues.push(issue2);
     */
  }
}
