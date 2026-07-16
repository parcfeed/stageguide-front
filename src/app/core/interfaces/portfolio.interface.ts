/**
 * Projet Portfolio interface
 * Represents a project in the stagiaire portfolio
 */
export interface ProjetPortfolio {
  id: string;
  titre: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  lienProjet?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Portfolio list response
 * Returned by GET /stagiaire/portfolio/projets
 */
export interface PortfolioListResponse {
  utilisateurId: string;
  projets: ProjetPortfolio[];
  cv?: {
    title?: string | null;
    summary?: string | null;
    education?: string | null;
    experience?: string | null;
  };
  skills?: Array<{
    id: string;
    nom: string;
    categorie: string;
    niveau: string;
  }>;
}

/**
 * Create Project DTO
 * Used for POST /stagiaire/portfolio/projets
 */
export interface CreerProjetPayload {
  titre: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  lienProjet?: string;
}

/**
 * Update Project DTO
 * Used for PATCH /stagiaire/portfolio/projets/:id
 */
export interface ModifierProjetPayload {
  titre?: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  lienProjet?: string;
}

/**
 * Project response after creation/update
 */
export interface ProjetResponse extends ProjetPortfolio {
  message?: string;
}
