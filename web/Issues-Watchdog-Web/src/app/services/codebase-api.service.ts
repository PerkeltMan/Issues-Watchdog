import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CodebaseFile } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CodebaseApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl || '/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetches the codebase snapshot (list of files and their content).
   */
  getCodebaseSnapshot(): Observable<CodebaseFile[]> {
    return this.http.get<CodebaseFile[]>(`${this.apiBaseUrl}/codebase/snapshot`);
  }
}

