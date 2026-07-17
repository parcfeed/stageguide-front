import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ListerOffresStageDto, 
  ListerOffresEmploiDto, 
  OffresStageResponse, 
  OffresEmploiResponse 
} from '../interfaces/opportunites.interface';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class OpportunitesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/opportunites`;

  /**
   * Fetch internship offers matching optional filters
   */
  listerOffresStage(filtres?: ListerOffresStageDto): Observable<OffresStageResponse> {
    const params = this.buildParams(filtres);
    return this.http.get<OffresStageResponse>(`${this.apiUrl}/offres-stage`, { params });
  }

  /**
   * Fetch job offers matching optional filters
   */
  listerOffresEmploi(filtres?: ListerOffresEmploiDto): Observable<OffresEmploiResponse> {
    const params = this.buildParams(filtres);
    return this.http.get<OffresEmploiResponse>(`${this.apiUrl}/offres-emploi`, { params });
  }

  /**
   * Convert filter DTO object to HttpParams
   */
  private buildParams(filtres?: Record<string, any>): HttpParams {
    let params = new HttpParams();
    if (!filtres) return params;

    Object.keys(filtres).forEach(key => {
      const val = filtres[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });

    return params;
  }
}
