import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.issuesService.getIssues().subscribe((issues) => {
      this.issues = issues;
    });
  }
}
