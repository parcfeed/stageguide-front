export interface DashboardStat {
  label: string;
  value: string;
  trend: string;
}

export interface ProfileProgressStep {
  label: string;
  done: boolean;
}

export interface ProfileProgression {
  pourcentage: number;
  etapes: ProfileProgressStep[];
}

export interface SuggestedMentor {
  name: string | null;
  title: string | null;
  expertise: string[];
  matchScore: number | null;
}

export interface DashboardListItem {
  id?: string;
  title?: string;
  label?: string;
  name?: string;
  description?: string;
  date?: string;
  status?: string;
}

export interface StagiaireDashboard {
  utilisateurId: string;
  stats: DashboardStat[];
  progressionProfil: ProfileProgression;
  mentorSuggere: SuggestedMentor;
  formations: DashboardListItem[];
  sessionsAVenir: DashboardListItem[];
  activitesRecentes: DashboardListItem[];
  messages: DashboardListItem[];
}
