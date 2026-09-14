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
  RepondreDemandeMentoratResponse,
  ObjectifMentorat,
  PlanifierSessionPayload,
  SessionMentoratItem,
  EvaluerSoftSkillsPayload
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

  // --- Sessions & iCal ---
  planifierSession(payload: PlanifierSessionPayload): Observable<SessionMentoratItem> {
    return this.http.post<SessionMentoratItem>(`${API_BASE_URL}/mentor/mentorat/sessions`, payload);
  }

  telechargerIcal(sessionId: string): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/mentor/mentorat/sessions/${sessionId}/ical`, { responseType: 'blob' });
  }

  // --- Évaluation Soft Skills ---
  evaluerSoftSkills(payload: EvaluerSoftSkillsPayload): Observable<any> {
    return this.http.post(`${API_BASE_URL}/mentor/mentorat/evaluations`, payload);
  }

  // --- Objectifs Mentorat (Stagiaire) ---
  listerObjectifs(): Observable<ObjectifMentorat[]> {
    return this.http.get<ObjectifMentorat[]>(`${API_BASE_URL}/stagiaire/mentorat/objectifs`);
  }

  creerObjectif(payload: { titre: string; statut?: string }): Observable<ObjectifMentorat> {
    return this.http.post<ObjectifMentorat>(`${API_BASE_URL}/stagiaire/mentorat/objectifs`, payload);
  }

  modifierObjectif(id: string, payload: { titre?: string; statut?: string }): Observable<ObjectifMentorat> {
    return this.http.patch<ObjectifMentorat>(`${API_BASE_URL}/stagiaire/mentorat/objectifs/${id}`, payload);
  }

  supprimerObjectif(id: string): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/stagiaire/mentorat/objectifs/${id}`);
  }
}
