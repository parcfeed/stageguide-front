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
  matchScore?: number;
  score?: number;
  raisons?: string[];
  matchReasons?: string[];
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
  matchScore?: number;
  score?: number;
  raisons?: string[];
  matchReasons?: string[];
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

export interface OffreSauvegardee {
  id: string;
  utilisateurId: string;
  offreStageId?: string | null;
  offreEmploiId?: string | null;
  createdAt: string;
  offreStage?: OffreStage | null;
  offreEmploi?: OffreEmploi | null;
}

export interface AlerteRecherche {
  id: string;
  utilisateurId: string;
  titre: string;
  message: string;
  type?: string;
  createdAt: string;
}

export interface CreerAlerteDto {
  domaine?: string;
  ville?: string;
  typeOffre?: 'STAGE' | 'EMPLOI' | 'TOUT';
  motsCles?: string;
}

/**
 * Le backend renvoie les recommandations et les favoris enveloppes dans un
 * objet ({ offres }, { sauvegardes }, { alertes }) et non en tableau brut.
 */
export interface RecommandationsResponse<T> {
  utilisateurId: string;
  total: number;
  offres: T[];
}

export interface OffresSauvegardeesResponse {
  utilisateurId: string;
  sauvegardes: OffreSauvegardee[];
}

export interface AlertesResponse {
  utilisateurId: string;
  alertes: AlerteRecherche[];
}

export type TypeOffre = 'STAGE' | 'EMPLOI';
