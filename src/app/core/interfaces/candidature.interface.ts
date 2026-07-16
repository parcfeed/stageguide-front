import { OffreStage, OffreEmploi } from './opportunites.interface';
import { User } from './user.interface';

export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  ANNULEE = 'ANNULEE'
}

export interface Candidature {
  id: string;
  utilisateurId: string;
  offreStageId: string | null;
  offreEmploiId: string | null;
  message: string | null;
  statut: StatutCandidature;
  createdAt: string;
  updatedAt: string;
  offreStage?: OffreStage | null;
  offreEmploi?: OffreEmploi | null;
  utilisateur?: User;
}

export interface CreerCandidatureDto {
  offreStageId?: string;
  offreEmploiId?: string;
  message?: string;
}
