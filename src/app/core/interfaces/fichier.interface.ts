export interface Fichier {
  id: string;
  nom: string;
  typeMime: string;
  typeDocument: TypeDocument;
  url: string | null;
  tailleOctets: number | null;
  createdAt: string;
  updatedAt: string;
}

export type TypeDocument =
  | 'CV'
  | 'LETTRE_MOTIVATION'
  | 'CONVENTION'
  | 'ATTESTATION'
  | 'CERTIFICAT'
  | 'AUTRE';

export interface FichiersListResponse {
  utilisateurId: string;
  conventions: Convention[];
  fichiers: Fichier[];
}

export interface Convention {
  id: string;
  nom: string;
  url?: string;
}

export interface EnregistrerFichierPayload {
  nom: string;
  typeMime: string;
  url?: string;
  typeDocument?: TypeDocument;
  tailleOctets?: number;
}

export interface EnregistrerFichierResponse {
  id: string;
  utilisateurId: string;
  nom: string;
  typeMime: string;
  url: string | null;
  typeDocument: TypeDocument;
  tailleOctets: number | null;
  message: string;
}
