export interface PartenaireInfo {
  id: string;
  nomEntreprise: string;
  ville: string;
}

export interface Convention {
  id: string;
  utilisateurId: string;
  partenaire?: PartenaireInfo;
  entrepriseNom: string;
  mentorNom?: string;
  statut: StatutConvention;
  dateDebut?: string;
  dateFin?: string;
  createdAt: string;
  updatedAt: string;
}

export type StatutConvention = 'BROUILLON' | 'EN_ATTENTE_SIGNATURE' | 'SIGNEE' | 'REFUSEE' | 'ANNULEE';

export interface ConventionsResponse {
  stagiaireId: string;
  conventions: Convention[];
}

export interface CreerConventionPayload {
  entrepriseNom: string;
  mentorNom?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface CreerConventionResponse {
  id: string;
  stagiaireId: string;
  statut: string;
  entrepriseNom: string;
  mentorNom: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  message: string;
}
