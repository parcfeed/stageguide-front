export interface EvaluationEntrepriseItem {
  id: string;
  stagiaireId: string;
  partenaireId: string;
  note: number;
  commentaire?: string | null;
  createdAt: string;
  updatedAt: string;
  partenaire?: {
    id: string;
    nomEntreprise: string;
    ville?: string;
    email?: string;
  };
}

export interface EvaluationsEntrepriseResponse {
  stagiaireId: string;
  evaluations: EvaluationEntrepriseItem[];
}

export interface SoumettreEvaluationEntreprisePayload {
  partenaireId: string;
  note: number;
  commentaire?: string;
}
