import { Routes } from '@angular/router';
import { IssueListComponent } from './pages/issue-list/issue-list.component';
import { IssueDetailComponent } from './pages/issue-detail/issue-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: IssueListComponent
  },
  {
    path: 'issues/:id',
    component: IssueDetailComponent
  }
];
