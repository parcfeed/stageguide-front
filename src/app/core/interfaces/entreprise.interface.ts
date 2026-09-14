import { User } from './user.interface';
import { OffreStage, OffreEmploi } from './opportunites.interface';
import { Candidature } from './candidature.interface';

export interface CreateOffreStagePayload {
  titre: string;
  description: string;
  ville: string;
  domaine?: string;
  duree?: string;
  remote?: boolean;
  logoUrl?: string;
  dateExpiration?: string;
}

export interface UpdateOffreStagePayload {
  titre?: string;
  description?: string;
  ville?: string;
  domaine?: string;
  duree?: string;
  remote?: boolean;
  logoUrl?: string;
  dateExpiration?: string;
}

export interface CreateOffreEmploiPayload {
  titre: string;
  description: string;
  ville: string;
  domaine?: string;
  typeContrat?: string;
  experience?: string;
  remote?: boolean;
  logoUrl?: string;
  dateExpiration?: string;
}

export interface UpdateOffreEmploiPayload {
  titre?: string;
  description?: string;
  ville?: string;
  domaine?: string;
  typeContrat?: string;
  experience?: string;
  remote?: boolean;
  logoUrl?: string;
  dateExpiration?: string;
}

export interface PlanifierEntretienPayload {
  candidatureId: string;
  dateProposee: string;
  lieu?: string;
  message?: string;
}

export interface Entretien {
  id: string;
  partenaireId: string;
  candidatureId: string;
  offreStageId: string | null;
  offreEmploiId: string | null;
  utilisateurId: string;
  dateProposee: string;
  lieu: string | null;
  message: string | null;
  statut?: string;
  createdAt: string;
  updatedAt: string;
  candidature?: Candidature;
  utilisateur?: User;
  offreStage?: OffreStage | null;
  offreEmploi?: OffreEmploi | null;
}

export interface EntrepriseStatistiques {
  totalOffresStage: number;
  totalOffresEmploi: number;
  offresActives: number;
  offresArchivees: number;
  totalCandidatures: number;
  candidaturesAcceptees: number;
  candidaturesRefusees: number;
  candidaturesEnAttente: number;
  tauxAcceptation: number;
  totalEntretiens: number;
  entretiensConfirmes: number;
  satisfactionMoyenne: number;
}

export interface EvaluerStagiairePayload {
  stagiaireId: string;
  candidatureId?: string;
  note: number;
  commentaire?: string;
}
