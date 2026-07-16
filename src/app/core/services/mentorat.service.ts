import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  CreerDemandeMentoratPayload,
  CreerDemandeMentoratResponse,
  MentorDemandesResponse,
  MentorStagiairesResponse,
  MentorSuggestionsResponse,
  MentoratStagiaireOverview,
  RepondreDemandeMentoratPayload,
  RepondreDemandeMentoratResponse
} from '../interfaces/mentorat.interface';

@Injectable({
  providedIn: 'root'
})
export class MentoratService {
  private readonly http = inject(HttpClient);

  listerDemandesStagiaire(): Observable<MentoratStagiaireOverview> {
    return this.http.get<MentoratStagiaireOverview>(`${API_BASE_URL}/stagiaire/mentorat/demandes`);
  }

  creerDemandeStagiaire(payload: CreerDemandeMentoratPayload): Observable<CreerDemandeMentoratResponse> {
    return this.http.post<CreerDemandeMentoratResponse>(
      `${API_BASE_URL}/stagiaire/mentorat/demandes`,
      payload
    );
  }

  listerMentorsSuggerees(): Observable<MentorSuggestionsResponse> {
    return this.http.get<MentorSuggestionsResponse>(`${API_BASE_URL}/correspondance/mentors`);
  }

  listerDemandesMentor(): Observable<MentorDemandesResponse> {
    return this.http.get<MentorDemandesResponse>(`${API_BASE_URL}/mentor/mentorat/demandes`);
  }

  repondreDemandeMentor(
    demandeId: string,
    payload: RepondreDemandeMentoratPayload
  ): Observable<RepondreDemandeMentoratResponse> {
    return this.http.patch<RepondreDemandeMentoratResponse>(
      `${API_BASE_URL}/mentor/mentorat/demandes/${demandeId}/reponse`,
      payload
    );
  }

  listerStagiairesMentor(): Observable<MentorStagiairesResponse> {
    return this.http.get<MentorStagiairesResponse>(`${API_BASE_URL}/mentor/stagiaires`);
  }
}
