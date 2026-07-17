import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { CatalogueResponse, MesFormationsResponse } from '../interfaces/formation.interface';

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
}
