import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { NotificationsListResponse } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly http = inject(HttpClient);

  listerNotifications(): Observable<NotificationsListResponse> {
    return this.http.get<NotificationsListResponse>(`${API_BASE_URL}/notifications`);
  }
}
