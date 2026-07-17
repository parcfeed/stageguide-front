import { UserRole } from './user.interface';

export interface AdminUser {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: UserRole;
  isActive: boolean;
  telephone?: string;
  ecole?: string;
  niveauEtudes?: string;
  entreprise?: string;
  poste?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPartner {
  id: string;
  nomEntreprise: string;
  ville: string;
  email: string;
  lienSiteWeb?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerPayload {
  nomEntreprise: string;
  ville: string;
  email: string;
  lienSiteWeb?: string;
}

export interface UpdatePartnerPayload {
  nomEntreprise?: string;
  ville?: string;
  email?: string;
  lienSiteWeb?: string;
}
