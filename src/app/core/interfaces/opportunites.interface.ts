export interface Partner {
  id: string;
  nomEntreprise: string;
  ville: string;
  email: string;
  lienSiteWeb?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OffreStage {
  id: string;
  partenaireId?: string | null;
  titre: string;
  description: string;
  ville: string;
  domaine?: string | null;
  duree?: string | null;
  remote: boolean;
  logoUrl?: string | null;
  datePublication: string;
  dateExpiration?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  partenaire?: Partner | null;
}

export interface OffreEmploi {
  id: string;
  partenaireId?: string | null;
  titre: string;
  description: string;
  ville: string;
  domaine?: string | null;
  typeContrat?: string | null;
  experience?: string | null;
  remote: boolean;
  logoUrl?: string | null;
  datePublication: string;
  dateExpiration?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  partenaire?: Partner | null;
}

export interface ListerOffresStageDto {
  search?: string;
  ville?: string;
  domaine?: string;
  remote?: boolean;
}

export interface ListerOffresEmploiDto {
  search?: string;
  ville?: string;
  domaine?: string;
  remote?: boolean;
}

export interface OffresStageResponse {
  filtres: ListerOffresStageDto;
  offres: OffreStage[];
}

export interface OffresEmploiResponse {
  filtres: ListerOffresEmploiDto;
  offres: OffreEmploi[];
}
