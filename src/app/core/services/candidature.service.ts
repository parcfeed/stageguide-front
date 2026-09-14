import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, CreerCandidatureDto } from '../interfaces/candidature.interface';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/stagiaire/candidatures`;

  /**
   * Get the logged-in student's applications
   */
  listerCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.apiUrl);
  }

  /**
   * Create a new application
   */
  creerCandidature(donnees: CreerCandidatureDto): Observable<Candidature> {
    return this.http.post<Candidature>(this.apiUrl, donnees);
  }

  /**
   * Annuler une candidature
   */
  annulerCandidature(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/annuler`, {});
  }
}
