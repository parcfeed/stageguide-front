export interface MembreReseau {
  id: string;
  prenom: string;
  nom: string;
  role: 'STAGIAIRE' | 'MENTOR' | 'ENTREPRISE' | 'ADMIN' | 'TUTEUR' | string;
  ecole?: string;
  niveauEtudes?: string;
  entreprise?: string;
  poste?: string;
  bio?: string;
  createdAt?: string;
}

export interface SuggestionReseau extends MembreReseau {
  scoreMatch: number;
  raisons: string[];
}

export interface SuggestionsResponse {
  utilisateurId: string;
  total: number;
  suggestions: SuggestionReseau[];
}

export interface MembresResponse {
  total: number;
  membres: MembreReseau[];
}

export interface ConnexionContact {
  id: string;
  prenom: string;
  nom: string;
  role: string;
  poste?: string;
  entreprise?: string;
  ecole?: string;
}

export interface ConnexionActive {
  id: string;
  contact: ConnexionContact;
  connecteLe: string;
}

export interface DemandeConnexionItem {
  id: string;
  demandeurId: string;
  receveurId: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  message?: string;
  createdAt: string;
  demandeur?: ConnexionContact;
  receveur?: ConnexionContact;
}

export interface ConnexionsResponse {
  totalActives: number;
  actives: ConnexionActive[];
  demandesRecues: DemandeConnexionItem[];
  demandesEnvoyees: DemandeConnexionItem[];
}

export interface EnvoyerDemandeConnexionPayload {
  destinataireId: string;
  message?: string;
}

export interface RepondreConnexionPayload {
  decision: 'ACCEPTEE' | 'REFUSEE';
}
