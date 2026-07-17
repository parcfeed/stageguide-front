import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OffreStage, OffreEmploi } from '../interfaces/opportunites.interface';
import { Candidature } from '../interfaces/candidature.interface';
import { 
  CreateOffreStagePayload, 
  UpdateOffreStagePayload, 
  CreateOffreEmploiPayload, 
  UpdateOffreEmploiPayload, 
  PlanifierEntretienPayload, 
  Entretien 
} from '../interfaces/entreprise.interface';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/entreprise`;

  // --- Offres de Stage ---
  listerOffresStage(): Observable<OffreStage[]> {
    return this.http.get<OffreStage[]>(`${this.apiUrl}/offres-stage`);
  }

  creerOffreStage(payload: CreateOffreStagePayload): Observable<OffreStage> {
    return this.http.post<OffreStage>(`${this.apiUrl}/offres-stage`, payload);
  }

  modifierOffreStage(id: string, payload: UpdateOffreStagePayload): Observable<OffreStage> {
    return this.http.patch<OffreStage>(`${this.apiUrl}/offres-stage/${id}`, payload);
  }

  archiverOffreStage(id: string): Observable<OffreStage> {
    return this.http.patch<OffreStage>(`${this.apiUrl}/offres-stage/${id}/archive`, {});
  }

  // --- Offres d'Emploi ---
  listerOffresEmploi(): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(`${this.apiUrl}/offres-emploi`);
  }

  creerOffreEmploi(payload: CreateOffreEmploiPayload): Observable<OffreEmploi> {
    return this.http.post<OffreEmploi>(`${this.apiUrl}/offres-emploi`, payload);
  }

  modifierOffreEmploi(id: string, payload: UpdateOffreEmploiPayload): Observable<OffreEmploi> {
    return this.http.patch<OffreEmploi>(`${this.apiUrl}/offres-emploi/${id}`, payload);
  }

  archiverOffreEmploi(id: string): Observable<OffreEmploi> {
    return this.http.patch<OffreEmploi>(`${this.apiUrl}/offres-emploi/${id}/archive`, {});
  }

  // --- Candidatures Reçues ---
  listerCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidatures`);
  }

  // --- Entretiens ---
  listerEntretiens(): Observable<Entretien[]> {
    return this.http.get<Entretien[]>(`${this.apiUrl}/entretiens`);
  }

  planifierEntretien(payload: PlanifierEntretienPayload): Observable<Entretien> {
    return this.http.post<Entretien>(`${this.apiUrl}/entretiens`, payload);
  }
}
