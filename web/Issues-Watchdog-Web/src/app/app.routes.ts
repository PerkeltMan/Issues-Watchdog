import { Routes } from '@angular/router';
import { IssueListComponent } from './components/issue-list/issue-list.component';
import { IssueDetailComponent } from './components/issue-detail/issue-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: IssueListComponent,
  },
  {
    path: 'issues/:id',
    component: IssueDetailComponent,
  },
  // Wildcard route: redirect any unknown paths back to the root list
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
