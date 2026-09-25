import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  EvaluationsEntrepriseResponse,
  SoumettreEvaluationEntreprisePayload,
  EvaluationEntrepriseItem
} from '../interfaces/evaluation.interface';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/stagiaire/evaluations-entreprise`;

  /**
   * Liste les évaluations reçues / données par le stagiaire pour ses entreprises d'accueil
   */
  listerEvaluationsEntreprise(): Observable<EvaluationsEntrepriseResponse> {
    return this.http.get<EvaluationsEntrepriseResponse>(this.apiUrl);
  }

  /**
   * Soumettre ou mettre à jour une évaluation (note de 1 à 5 et commentaire) sur une entreprise
   */
  soumettreEvaluationEntreprise(payload: SoumettreEvaluationEntreprisePayload): Observable<EvaluationEntrepriseItem> {
    return this.http.post<EvaluationEntrepriseItem>(this.apiUrl, payload);
  }
}
