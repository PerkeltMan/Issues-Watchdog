import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from '../models/issue';

@Injectable({
  providedIn: 'root',
})
export class IssuesService {
  private http = inject(HttpClient);

  getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>('https://issues-watchdog.onrender.com/issues');
  }
}
