import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { 
  AdminUser, 
  AdminPartner, 
  ListUsersResponse, 
  CreatePartnerPayload, 
  UpdatePartnerPayload,
  AdminOffresResponse 
} from '../interfaces/admin.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin`;

  listUsers(params?: { search?: string; role?: string; isActive?: boolean; page?: number; limit?: number }): Observable<ListUsersResponse> {
    let hp = new HttpParams();
    if (params) {
      if (params.search) hp = hp.set('search', params.search);
      if (params.role) hp = hp.set('role', params.role);
      if (params.isActive !== undefined) hp = hp.set('isActive', String(params.isActive));
      if (params.page) hp = hp.set('page', String(params.page));
      if (params.limit) hp = hp.set('limit', String(params.limit));
    }
    return this.http.get<ListUsersResponse>(`${this.baseUrl}/users`, { params: hp });
  }

  getUser(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, data: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}`, data);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}/status`, { isActive });
  }

  updateUserRole(id: string, role: string): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}/role`, { role });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  listPartners(): Observable<AdminPartner[]> {
    return this.http.get<AdminPartner[]>(`${this.baseUrl}/partners`);
  }

  createPartner(data: CreatePartnerPayload): Observable<AdminPartner> {
    return this.http.post<AdminPartner>(`${this.baseUrl}/partners`, data);
  }

  updatePartner(id: string, data: UpdatePartnerPayload): Observable<AdminPartner> {
    return this.http.patch<AdminPartner>(`${this.baseUrl}/partners/${id}`, data);
  }

  deletePartner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/partners/${id}`);
  }

  // --- Modération des Offres ---
  listerOffres(params?: { type?: string; search?: string }): Observable<AdminOffresResponse> {
    let hp = new HttpParams();
    if (params?.type) hp = hp.set('type', params.type);
    if (params?.search) hp = hp.set('search', params.search);
    return this.http.get<AdminOffresResponse>(`${this.baseUrl}/offres`, { params: hp });
  }

  validerOffre(type: 'stage' | 'emploi', id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/offres/${type}/${id}/valider`, {});
  }

  archiverOffre(type: 'stage' | 'emploi', id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/offres/${type}/${id}/archiver`, {});
  }

  supprimerOffre(type: 'stage' | 'emploi', id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/offres/${type}/${id}`);
  }
}
