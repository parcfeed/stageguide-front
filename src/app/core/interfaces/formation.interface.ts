export interface Formation {
  id: string;
  titre: string;
  description?: string;
  domaine?: string;
  niveau?: string;
  dureeHeures?: number;
  thumbnailUrl?: string;
  estActive?: boolean;
  createdAt?: string;
}

export interface InscriptionFormation {
  id: string;
  formationId?: string;
  progression: number;
  completedAt?: string;
  createdAt?: string;
  formation: Formation;
}

export interface CatalogueResponse {
  formations: Formation[];
}

export interface MesFormationsResponse {
  utilisateurId: string;
  inscriptions: InscriptionFormation[];
}
