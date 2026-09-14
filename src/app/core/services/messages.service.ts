import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  ConversationsListResponse,
  ConversationDetailResponse,
  EnvoyerMessagePayload,
  EnvoyerMessageResponse,
  CreerConversationPayload
} from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly http = inject(HttpClient);

  listerConversations(): Observable<ConversationsListResponse> {
    return this.http.get<ConversationsListResponse>(`${API_BASE_URL}/messages`);
  }

  getConversation(conversationId: string): Observable<ConversationDetailResponse> {
    return this.http.get<ConversationDetailResponse>(`${API_BASE_URL}/messages/${conversationId}`);
  }

  envoyerMessage(conversationId: string, payload: EnvoyerMessagePayload): Observable<EnvoyerMessageResponse> {
    return this.http.post<EnvoyerMessageResponse>(
      `${API_BASE_URL}/messages/${conversationId}/messages`,
      payload
    );
  }

  creerConversation(payload: CreerConversationPayload): Observable<any> {
    return this.http.post(`${API_BASE_URL}/messages/conversations`, payload);
  }
}
