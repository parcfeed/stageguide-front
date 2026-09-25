/**
 * Stagiaire Profile interface
 * Represents the stagiaire profile returned by GET /stagiaire/profil
 */
export interface StagiaireProfile {
  utilisateurId: string;
  email?: string;
  prenom: string;
  nom: string;
  telephone?: string;
  ecole?: string;
  niveauEtudes?: string;
  bio?: string;
  role?: string;
}

/**
 * Stagiaire Profile Update DTO
 * Used for PATCH /stagiaire/profil
 * Returns: StagiaireProfile + message
 */
export interface UpdateStagiaireProfilePayload {
  telephone?: string;
  ecole?: string;
  niveauEtudes?: string;
  bio?: string;
}

export interface StagiaireProfileResponse extends StagiaireProfile {
  message?: string;
}

/**
 * Mentor Profile interface
 * Represents the mentor profile returned by GET /mentor/profil
 */
export interface MentorProfile {
  utilisateurId: string;
  email?: string;
  prenom: string;
  nom: string;
  telephone?: string;
  entreprise?: string;
  poste?: string;
  bio?: string;
  role?: string;
}

/**
 * Mentor Profile Update DTO
 * Used for PATCH /mentor/profil
 * Returns: MentorProfile + message
 */
export interface UpdateMentorProfilePayload {
  telephone?: string;
  entreprise?: string;
  poste?: string;
  bio?: string;
}

export interface MentorProfileResponse extends MentorProfile {
  message?: string;
}

export interface EntrepriseProfile {
  utilisateurId: string;
  email?: string;
  prenom: string;
  nom: string;
  telephone?: string;
  entreprise?: string;
  poste?: string;
  bio?: string;
  role?: string;
}
