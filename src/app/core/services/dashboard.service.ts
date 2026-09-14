import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { StagiaireDashboard, CalendrierResponse } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStagiaireDashboard(): Observable<StagiaireDashboard> {
    return this.http.get<StagiaireDashboard>(`${API_BASE_URL}/stagiaire/tableau-de-bord`);
  }

  getCalendrier(): Observable<CalendrierResponse> {
    return this.http.get<CalendrierResponse>(`${API_BASE_URL}/stagiaire/tableau-de-bord/calendrier`);
  }
}
