import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CodebaseFile } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CodebaseApiService {
  private apiUrl = `${environment.apiBaseUrl}/codebase`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch the codebase snapshot
   * GET {apiBaseUrl}/codebase
   */
  getCodebaseSnapshot(): Observable<CodebaseFile[]> {
    return this.http.get<CodebaseFile[]>(this.apiUrl);
  }
}

