import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  FichiersListResponse,
  EnregistrerFichierPayload,
  EnregistrerFichierResponse,
} from '../interfaces/fichier.interface';

@Injectable({
  providedIn: 'root',
})
export class FichiersService {
  private readonly http = inject(HttpClient);

  listerFichiers(): Observable<FichiersListResponse> {
    return this.http.get<FichiersListResponse>(`${API_BASE_URL}/fichiers`);
  }

  enregistrerFichier(
    payload: EnregistrerFichierPayload
  ): Observable<EnregistrerFichierResponse> {
    return this.http.post<EnregistrerFichierResponse>(
      `${API_BASE_URL}/fichiers`,
      payload
    );
  }
}
