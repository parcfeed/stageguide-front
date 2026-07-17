import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { CertificatsResponse } from '../interfaces/certificat.interface';

@Injectable({ providedIn: 'root' })
export class CertificatsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/stagiaire/certificats`;

  lister(): Observable<CertificatsResponse> {
    return this.http.get<CertificatsResponse>(this.baseUrl);
  }
}
