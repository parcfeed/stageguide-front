export interface ParticipantInfo {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  role?: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  expediteurId: string;
  contenu: string;
  fichierId?: string | null;
  lienRessource?: string | null;
  estSysteme?: boolean;
  creeLe: string;
  expediteur?: ParticipantInfo;
}

export interface ConversationListItem {
  id: string;
  titre?: string;
  dernierMessage?: string;
  dernierMessageDate?: string;
  participants: ParticipantInfo[];
  nonLu: number;
  misAJourLe: string;
}

export interface ConversationsListResponse {
  utilisateurId: string;
  conversations: ConversationListItem[];
}

export interface ConversationDetailResponse {
  conversationId: string;
  utilisateurId: string;
  participants: ParticipantInfo[];
  messages: MessageItem[];
}

export interface EnvoyerMessagePayload {
  contenu: string;
  lienRessource?: string;
  fichierId?: string;
}

export interface EnvoyerMessageResponse {
  id: string;
  conversationId: string;
  expediteurId: string;
  contenu: string;
  fichierId?: string | null;
  lienRessource?: string | null;
  creeLe: string;
}

export interface CreerConversationPayload {
  participantIds: string[];
  titre?: string;
  premierMessage?: string;
}
