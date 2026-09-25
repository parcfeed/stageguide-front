import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { CvStructure, CvPartageResponse } from '../interfaces/cv.interface';

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/stagiaire/cv`;

  /**
   * Récupère le CV dynamique structuré du stagiaire connecté
   */
  getMonCv(): Observable<CvStructure> {
    return this.http.get<CvStructure>(this.baseUrl);
  }

  /**
   * Récupère le CV d'un stagiaire cible pour un profil autorisé
   */
  getCvByUserId(userId: string): Observable<CvStructure> {
    return this.http.get<CvStructure>(`${this.baseUrl}/${userId}`);
  }

  /**
   * Télécharge le CV au format PDF
   */
  telechargerPdf(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf`, { responseType: 'blob' });
  }

  /**
   * Télécharge le CV d'un stagiaire cible pour un profil autorisé
   */
  telechargerPdfByUserId(userId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${userId}/pdf`, { responseType: 'blob' });
  }

  /**
   * Génère un lien de partage public sécurisé avec token
   */
  genererLienPartage(): Observable<CvPartageResponse> {
    return this.http.get<CvPartageResponse>(`${this.baseUrl}/partage`);
  }

  /**
   * Récupère le CV public via token (sans authentification)
   */
  getCvPublic(token: string): Observable<CvStructure> {
    return this.http.get<CvStructure>(`${this.baseUrl}/partage/${token}`);
  }
}
