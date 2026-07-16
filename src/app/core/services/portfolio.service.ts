import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  ProjetPortfolio,
  PortfolioListResponse,
  CreerProjetPayload,
  ModifierProjetPayload,
  ProjetResponse
} from '../interfaces/portfolio.interface';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;

  /**
   * List all projects in portfolio
   * GET /stagiaire/portfolio/projets
   */
  listerProjets(): Observable<PortfolioListResponse> {
    return this.http.get<PortfolioListResponse>(`${this.apiUrl}/stagiaire/portfolio/projets`);
  }

  /**
   * Create a new portfolio project
   * POST /stagiaire/portfolio/projets
   */
  creerProjet(payload: CreerProjetPayload): Observable<ProjetPortfolio> {
    return this.http.post<ProjetPortfolio>(
      `${this.apiUrl}/stagiaire/portfolio/projets`,
      payload
    );
  }

  /**
   * Update a portfolio project
   * PATCH /stagiaire/portfolio/projets/:id
   */
  modifierProjet(projetId: string, payload: ModifierProjetPayload): Observable<ProjetResponse> {
    return this.http.patch<ProjetResponse>(
      `${this.apiUrl}/stagiaire/portfolio/projets/${projetId}`,
      payload
    );
  }

  /**
   * Delete a portfolio project
   * DELETE /stagiaire/portfolio/projets/:id
   */
  supprimerProjet(projetId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/stagiaire/portfolio/projets/${projetId}`
    );
  }
}
