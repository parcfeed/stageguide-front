import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, CreerCandidatureDto } from '../interfaces/candidature.interface';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/stagiaire/candidatures';

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
}
