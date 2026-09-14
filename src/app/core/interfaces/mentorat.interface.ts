export type MentoratDecision = 'ACCEPTEE' | 'REFUSEE';
export type MentoratStatut = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ACTIF' | string;

export interface MentorSummary {
  id?: string;
  name: string | null;
  title: string | null;
  company?: string | null;
  avatar?: string | null;
  bio?: string | null;
  expertise: string[];
  matchScore: number | null;
}

export interface MentoratTimelineStep {
  label: string;
  date: string;
  done: boolean;
}

export interface MentoratDemande {
  id: string;
  stagiaireId?: string;
  mentorId?: string;
  statut?: MentoratStatut;
  decision?: MentoratDecision;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  stagiaire?: MentoratPerson;
  mentor?: MentoratPerson;
}

export interface MentoratPerson {
  id?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string | null;
  ecole?: string | null;
  niveauEtudes?: string | null;
  entreprise?: string | null;
  poste?: string | null;
  bio?: string | null;
}

export interface MentoratListItem {
  id?: string;
  title?: string;
  label?: string;
  description?: string;
  date?: string;
  status?: string;
}

export interface ObjectifMentorat {
  id: string;
  utilisateurId: string;
  titre: string;
  statut: 'pending' | 'in_progress' | 'completed' | string;
  creePar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionMentoratItem {
  id: string;
  stagiaireId: string;
  mentorId: string;
  sujet: string;
  commenceLe: string;
  termineLe?: string | null;
  statut: 'PLANIFIEE' | 'TERMINEE' | 'ANNULEE' | string;
  stagiaire?: MentoratPerson;
  mentor?: MentoratPerson;
}

export interface PlanifierSessionPayload {
  stagiaireId: string;
  sujet: string;
  commenceLe: string;
  termineLe?: string;
}

export interface EvaluerSoftSkillsPayload {
  stagiaireId: string;
  communication?: number;
  resolutionProblemes?: number;
  adaptabilite?: number;
  travailEquipe?: number;
  commentaires?: string;
}

export interface MentoratStagiaireOverview {
  stagiaireId: string;
  mentor: MentorSummary;
  timeline: MentoratTimelineStep[];
  demandes: MentoratDemande[];
  goals: MentoratListItem[];
  sessions: MentoratListItem[];
  evaluation: unknown;
}

export interface MentorSuggestion extends MentorSummary {
  id?: string;
  prenom?: string;
  nom?: string;
  entreprise?: string | null;
  poste?: string | null;
}

export interface MentorSuggestionsResponse {
  stagiaireId: string;
  suggestions: MentorSuggestion[];
}

export interface CreerDemandeMentoratPayload {
  mentorId?: string;
  message?: string;
}

export interface CreerDemandeMentoratResponse extends CreerDemandeMentoratPayload {
  id: string;
  stagiaireId: string;
  statut: 'EN_ATTENTE';
  message: string;
}

export interface MentorDemandesResponse {
  mentorId: string;
  demandes: MentoratDemande[];
}

export interface RepondreDemandeMentoratPayload {
  decision: MentoratDecision;
}

export interface RepondreDemandeMentoratResponse extends RepondreDemandeMentoratPayload {
  mentorId: string;
  demandeId: string;
  message: string;
}

export interface MentorStagiairesResponse {
  mentorId: string;
  stagiaires: MentoratPerson[];
}
