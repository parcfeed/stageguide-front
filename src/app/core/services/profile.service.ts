import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  StagiaireProfile,
  MentorProfile,
  UpdateStagiaireProfilePayload,
  UpdateMentorProfilePayload,
  StagiaireProfileResponse,
  MentorProfileResponse
} from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;

  /**
   * Get stagiaire profile
   * GET /stagiaire/profil
   */
  getStagiaireProfile(): Observable<StagiaireProfile> {
    return this.http.get<StagiaireProfile>(`${this.apiUrl}/stagiaire/profil`);
  }

  /**
   * Update stagiaire profile
   * PATCH /stagiaire/profil
   */
  updateStagiaireProfile(payload: UpdateStagiaireProfilePayload): Observable<StagiaireProfileResponse> {
    return this.http.patch<StagiaireProfileResponse>(
      `${this.apiUrl}/stagiaire/profil`,
      payload
    );
  }

  /**
   * Get mentor profile
   * GET /mentor/profil
   */
  getMentorProfile(): Observable<MentorProfile> {
    return this.http.get<MentorProfile>(`${this.apiUrl}/mentor/profil`);
  }

  /**
   * Update mentor profile
   * PATCH /mentor/profil
   */
  updateMentorProfile(payload: UpdateMentorProfilePayload): Observable<MentorProfileResponse> {
    return this.http.patch<MentorProfileResponse>(
      `${this.apiUrl}/mentor/profil`,
      payload
    );
  }
}
