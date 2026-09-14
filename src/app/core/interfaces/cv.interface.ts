export interface CvCompetence {
  nom: string;
  niveau?: number;
  categorie?: string;
}

export interface CvProjet {
  id: string;
  titre: string;
  description?: string;
  tags?: string[];
  lienProjet?: string;
  imageUrl?: string;
}

export interface CvExperience {
  id: string;
  titrePoste: string;
  entrepriseNom: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface CvCertificat {
  id: string;
  titre: string;
  hashVerification: string;
  createdAt: string;
}

export interface CvStructure {
  id?: string;
  utilisateurId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  ecole?: string;
  niveauEtudes?: string;
  bio?: string;
  titre?: string;
  resume?: string;
  competences: CvCompetence[];
  projets: CvProjet[];
  experiences: CvExperience[];
  certificats: CvCertificat[];
}

export interface CvPartageResponse {
  lienPublic: string;
  token: string;
  expireLe: string;
}
