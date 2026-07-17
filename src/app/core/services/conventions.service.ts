import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { ConventionsResponse, CreerConventionPayload, CreerConventionResponse } from '../interfaces/convention.interface';

@Injectable({ providedIn: 'root' })
export class ConventionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/stagiaire/conventions`;

  lister(): Observable<ConventionsResponse> {
    return this.http.get<ConventionsResponse>(this.baseUrl);
  }

  creer(payload: CreerConventionPayload): Observable<CreerConventionResponse> {
    return this.http.post<CreerConventionResponse>(this.baseUrl, payload);
  }
}
