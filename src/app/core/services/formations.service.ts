import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { 
  CatalogueResponse, 
  MesFormationsResponse, 
  ForumResponse,
  ProgressionDetail, 
  SujetForum, 
  ReponseForum 
} from '../interfaces/formation.interface';

@Injectable({ providedIn: 'root' })
export class FormationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/stagiaire/formations`;

  listerCatalogue(): Observable<CatalogueResponse> {
    return this.http.get<CatalogueResponse>(this.baseUrl);
  }

  listerMesFormations(): Observable<MesFormationsResponse> {
    return this.http.get<MesFormationsResponse>(`${this.baseUrl}/mes-formations`);
  }

  inscrire(formationId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${formationId}/inscription`, {});
  }

  getProgression(formationId: string): Observable<ProgressionDetail> {
    return this.http.get<ProgressionDetail>(`${this.baseUrl}/${formationId}/progression`);
  }

  /**
   * Le backend (MettreAJourProgressionDto) n'accepte que le champ progression :
   * envoyer estTermine déclenche un 400 (forbidNonWhitelisted).
   */
  updateProgression(formationId: string, progression: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${formationId}/progression`, { progression });
  }

  getForum(formationId: string): Observable<SujetForum[]> {
    return this.http
      .get<ForumResponse>(`${this.baseUrl}/${formationId}/forum`)
      .pipe(map(res => res?.sujets ?? []));
  }

  creerSujet(formationId: string, payload: { titre: string; contenu: string }): Observable<SujetForum> {
    return this.http.post<SujetForum>(`${this.baseUrl}/${formationId}/forum`, payload);
  }

  repondreSujet(formationId: string, sujetId: string, payload: { contenu: string }): Observable<ReponseForum> {
    return this.http.post<ReponseForum>(`${this.baseUrl}/${formationId}/forum/${sujetId}/reponses`, payload);
  }
}
