import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  MembresResponse,
  SuggestionsResponse,
  ConnexionsResponse,
  EnvoyerDemandeConnexionPayload,
  RepondreConnexionPayload
} from '../interfaces/reseau.interface';

@Injectable({
  providedIn: 'root'
})
export class ReseauService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/reseau`;

  /**
   * Lister et rechercher les membres de la communauté
   */
  listerMembres(recherche?: string, role?: string): Observable<MembresResponse> {
    let params = new HttpParams();
    if (recherche) params = params.set('recherche', recherche);
    if (role) params = params.set('role', role);
    return this.http.get<MembresResponse>(`${this.baseUrl}/membres`, { params });
  }

  /**
   * Récupérer les suggestions personnalisées de contacts avec score de matching
   */
  getSuggestions(): Observable<SuggestionsResponse> {
    return this.http.get<SuggestionsResponse>(`${this.baseUrl}/suggestions`);
  }

  /**
   * Lister les connexions actives et demandes en attente
   */
  listerConnexions(): Observable<ConnexionsResponse> {
    return this.http.get<ConnexionsResponse>(`${this.baseUrl}/connexions`);
  }

  /**
   * Envoyer une demande de connexion à un membre
   */
  demanderConnexion(payload: EnvoyerDemandeConnexionPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/connexions`, payload);
  }

  /**
   * Accepter ou refuser une demande de connexion
   */
  repondreConnexion(connexionId: string, payload: RepondreConnexionPayload): Observable<any> {
    return this.http.patch(`${this.baseUrl}/connexions/${connexionId}`, payload);
  }
}
