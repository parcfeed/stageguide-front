export enum UserRole {
  STAGIAIRE = 'STAGIAIRE',
  MENTOR = 'MENTOR',
  TUTEUR = 'TUTEUR',
  ADMIN = 'ADMIN',
  ENTREPRISE = 'ENTREPRISE'
}

export type AuthenticatedUserRole =
  | 'stagiaire'
  | 'mentor'
  | 'tuteur'
  | 'admin'
  | 'entreprise';

export interface User {
  id: string;
  email: string;
  role: AuthenticatedUserRole;
  prenom: string;
  nom: string;
  telephone?: string;
  bio?: string;
  entreprise?: string;
  poste?: string;
  ecole?: string;
  niveauEtudes?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  confirmPassword: string;
  prenom: string;
  nom: string;
  role: UserRole;
  consentGiven: boolean;
  telephone?: string;
  ecole?: string;
  niveauEtudes?: string;
  entreprise?: string;
  poste?: string;
  bio?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
