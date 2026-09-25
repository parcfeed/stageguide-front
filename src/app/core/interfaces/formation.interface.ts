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

export interface ForumResponse {
  formationId: string;
  total: number;
  sujets: SujetForum[];
}

export interface ProgressionDetail {
  formationId: string;
  titre: string;
  progression: number;
  estTermine: boolean;
  dateInscription?: string;
  modulesTermines?: number;
  totalModules?: number;
}

export interface ReponseForum {
  id: string;
  sujetId: string;
  auteurId: string;
  contenu: string;
  createdAt: string;
  auteur?: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
  };
}

export interface SujetForum {
  id: string;
  formationId: string;
  auteurId: string;
  titre: string;
  contenu: string;
  createdAt: string;
  auteur?: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
  };
  reponses?: ReponseForum[];
  _count?: {
    reponses: number;
  };
}
