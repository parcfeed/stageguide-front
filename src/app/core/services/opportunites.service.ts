import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { 
  AlertesResponse,
  AlerteRecherche,
  CreerAlerteDto,
  ListerOffresEmploiDto,
  ListerOffresStageDto,
  OffresEmploiResponse,
  OffreEmploi,
  OffresSauvegardeesResponse,
  OffresStageResponse,
  OffreSauvegardee,
  OffreStage,
  RecommandationsResponse
} from '../interfaces/opportunites.interface';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class OpportunitesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/opportunites`;
  private readonly alertesUrl = `${API_BASE_URL}/stagiaire/alertes`;

  /**
   * Fetch internship offers matching optional filters
   */
  listerOffresStage(filtres?: ListerOffresStageDto): Observable<OffresStageResponse> {
    const params = this.buildParams(filtres);
    return this.http.get<OffresStageResponse>(`${this.apiUrl}/offres-stage`, { params });
  }

  /**
   * Get detail of an internship offer
   */
  getOffreStage(id: string): Observable<OffreStage> {
    return this.http.get<OffreStage>(`${this.apiUrl}/offres-stage/${id}`);
  }

  /**
   * Recommandations intelligentes de stages pour le profil stagiaire
   */
  getRecommandationsStage(): Observable<OffreStage[]> {
    return this.http
      .get<RecommandationsResponse<OffreStage>>(`${this.apiUrl}/offres-stage/recommandations`)
      .pipe(map(res => res?.offres ?? []));
  }

  /**
   * Fetch job offers matching optional filters
   */
  listerOffresEmploi(filtres?: ListerOffresEmploiDto): Observable<OffresEmploiResponse> {
    const params = this.buildParams(filtres);
    return this.http.get<OffresEmploiResponse>(`${this.apiUrl}/offres-emploi`, { params });
  }

  /**
   * Get detail of a job offer
   */
  getOffreEmploi(id: string): Observable<OffreEmploi> {
    return this.http.get<OffreEmploi>(`${this.apiUrl}/offres-emploi/${id}`);
  }

  /**
   * Recommandations intelligentes d'emplois pour le profil
   */
  getRecommandationsEmploi(): Observable<OffreEmploi[]> {
    return this.http
      .get<RecommandationsResponse<OffreEmploi>>(`${this.apiUrl}/offres-emploi/recommandations`)
      .pipe(map(res => res?.offres ?? []));
  }

  /**
   * Lister les offres sauvegardées en favoris
   */
  listerOffresSauvegardees(): Observable<OffreSauvegardee[]> {
    return this.http
      .get<OffresSauvegardeesResponse>(`${this.apiUrl}/offres-sauvegardees`)
      .pipe(map(res => res?.sauvegardes ?? []));
  }

  /**
   * Sauvegarder une offre
   */
  sauvegarderOffre(payload: { offreStageId?: string; offreEmploiId?: string }): Observable<OffreSauvegardee> {
    return this.http.post<OffreSauvegardee>(`${this.apiUrl}/offres-sauvegardees`, payload);
  }

  /**
   * Supprimer une offre sauvegardée
   */
  supprimerOffreSauvegardee(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/offres-sauvegardees/${id}`);
  }

  /**
   * Lister les alertes de recherche du stagiaire
   */
  listerAlertes(): Observable<AlerteRecherche[]> {
    return this.http
      .get<AlertesResponse>(this.alertesUrl)
      .pipe(map(res => res?.alertes ?? []));
  }

  /**
   * Créer une alerte de recherche
   */
  creerAlerte(payload: CreerAlerteDto): Observable<AlerteRecherche> {
    return this.http.post<AlerteRecherche>(this.alertesUrl, payload);
  }

  /**
   * Supprimer une alerte
   */
  supprimerAlerte(id: string): Observable<any> {
    return this.http.delete(`${this.alertesUrl}/${id}`);
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
