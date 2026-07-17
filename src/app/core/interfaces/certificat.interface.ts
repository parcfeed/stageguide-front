export interface Certificat {
  id: string;
  titre: string;
  hashVerification: string;
  urlDocument?: string;
  createdAt: string;
}

export interface CertificatsResponse {
  utilisateurId: string;
  certificats: Certificat[];
}
