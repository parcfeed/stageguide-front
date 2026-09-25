import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, forkJoin, of } from 'rxjs';
import {
  MentorDemandesResponse,
  MentorSessionsResponse,
  MentorStagiairesResponse,
  MentorSuggestionsResponse,
  MentoratDecision,
  MentoratDemande,
  MentoratStagiaireOverview,
  SessionMentoratItem
} from '../../../../core/interfaces/mentorat.interface';
import { MentorProfile } from '../../../../core/interfaces/profile.interface';
import { User } from '../../../../core/interfaces/user.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { CvService } from '../../../../core/services/cv.service';
import { MentoratService } from '../../../../core/services/mentorat.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-mentorat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mentorat.component.html',
  styleUrl: './mentorat.component.css'
})
export class MentoratComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly mentoratService = inject(MentoratService);
  private readonly profileService = inject(ProfileService);
  private readonly cvService = inject(CvService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly currentUser = signal<User | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly stagiaireOverview = signal<MentoratStagiaireOverview | null>(null);
  protected readonly mentorSuggestions = signal<MentorSuggestionsResponse | null>(null);
  protected readonly mentorDemandes = signal<MentorDemandesResponse | null>(null);
  protected readonly mentorStagiaires = signal<MentorStagiairesResponse | null>(null);
  protected readonly mentorSessions = signal<SessionMentoratItem[]>([]);
  protected readonly mentorProfile = signal<MentorProfile | null>(null);
  protected readonly profilePreview = signal<{ title: string; data: any } | null>(null);
  protected readonly showProfileModal = signal(false);

  protected readonly requestForm = this.fb.nonNullable.group({
    mentorId: [''],
    message: ['']
  });

  protected readonly mentorProfileForm = this.fb.nonNullable.group({
    telephone: [''],
    entreprise: ['', [Validators.minLength(1)]],
    poste: [''],
    bio: ['']
  });

  protected readonly sessionForm = this.fb.nonNullable.group({
    stagiaireId: ['', [Validators.required]],
    sujet: ['', [Validators.required, Validators.minLength(3)]],
    commenceLe: ['', [Validators.required]],
    termineLe: ['']
  });

  protected readonly isStagiaire = computed(() => this.currentUser()?.role === 'stagiaire');
  protected readonly isMentor = computed(() => this.currentUser()?.role === 'mentor');
  protected readonly mentorDemandesList = computed(() => this.mentorDemandes()?.demandes ?? []);
  protected readonly mentorStagiairesList = computed(() => this.mentorStagiaires()?.stagiaires ?? []);
  protected readonly mentorSessionsList = computed(() => this.mentorSessions() ?? []);
  protected readonly suggestionsList = computed(() => this.mentorSuggestions()?.suggestions ?? []);

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.currentUser.set(user);
      this.loadForRole(user);
      return;
    }

    this.authService.loadCurrentUser().subscribe({
      next: loadedUser => {
        this.currentUser.set(loadedUser);
        this.loadForRole(loadedUser);
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(error, 'Impossible de charger votre session.'));
        this.isLoading.set(false);
      }
    });
  }

  protected submitRequest(): void {
    if (!this.isStagiaire()) {
      return;
    }

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.requestForm.getRawValue();

    this.mentoratService.creerDemandeStagiaire({
      mentorId: formValue.mentorId || undefined,
      message: formValue.message || undefined
    }).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: response => {
        this.successMessage.set(response.message);
        this.requestForm.reset();
        this.loadStagiaireData();
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de creer la demande de mentorat.'
        ));
      }
    });
  }

  protected saveMentorProfile(): void {
    if (!this.isMentor()) {
      return;
    }

    if (this.mentorProfileForm.invalid) {
      this.mentorProfileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.mentorProfileForm.getRawValue();

    this.profileService.updateMentorProfile({
      telephone: formValue.telephone || undefined,
      entreprise: formValue.entreprise || undefined,
      poste: formValue.poste || undefined,
      bio: formValue.bio || undefined
    }).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: response => {
        this.mentorProfile.set(response);
        this.successMessage.set(response.message || 'Profil mentor mis a jour avec succes.');
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de mettre a jour le profil mentor.'
        ));
      }
    });
  }

  protected submitSession(): void {
    if (!this.isMentor()) {
      return;
    }

    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.sessionForm.getRawValue();

    this.mentoratService.planifierSession({
      stagiaireId: formValue.stagiaireId,
      sujet: formValue.sujet,
      commenceLe: new Date(formValue.commenceLe).toISOString(),
      termineLe: formValue.termineLe ? new Date(formValue.termineLe).toISOString() : undefined
    }).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Session planifiée avec succès.');
        this.sessionForm.reset();
        this.loadMentorData();
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de planifier la session de mentorat.'
        ));
      }
    });
  }

  protected respondToRequest(demande: MentoratDemande, decision: MentoratDecision): void {
    if (!demande.id) {
      this.errorMessage.set('Demande de mentorat invalide.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.mentoratService.repondreDemandeMentor(demande.id, { decision }).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: response => {
        this.successMessage.set(response.message);
        this.loadMentorData();
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible d enregistrer la decision.'
        ));
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  protected personName(person?: { prenom?: string; nom?: string; name?: string | null }): string {
    if (!person) {
      return 'Non renseigne';
    }

    if (person.name) {
      return person.name;
    }

    return `${person.prenom ?? ''} ${person.nom ?? ''}`.trim() || 'Non renseigne';
  }

  private loadForRole(user: User): void {
    if (user.role === 'stagiaire') {
      this.loadStagiaireData();
      return;
    }

    if (user.role === 'mentor') {
      this.loadMentorData();
      return;
    }

    this.errorMessage.set('Le module Mentorat est disponible pour les roles Stagiaire et Mentor.');
    this.isLoading.set(false);
  }

  private loadStagiaireData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      overview: this.mentoratService.listerDemandesStagiaire(),
      suggestions: this.mentoratService.listerMentorsSuggerees().pipe(
        catchError(() => of({ stagiaireId: '', suggestions: [] }))
      )
    }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: ({ overview, suggestions }) => {
        this.stagiaireOverview.set(overview);
        this.mentorSuggestions.set(suggestions);
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de charger vos informations de mentorat.'
        ));
      }
    });
  }

  private loadMentorData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      profile: this.profileService.getMentorProfile(),
      demandes: this.mentoratService.listerDemandesMentor(),
      stagiaires: this.mentoratService.listerStagiairesMentor(),
      sessions: this.mentoratService.listerSessionsMentor()
    }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: ({ profile, demandes, stagiaires, sessions }) => {
        this.mentorProfile.set(profile);
        this.mentorDemandes.set(demandes);
        this.mentorStagiaires.set(stagiaires);
        this.mentorSessions.set(sessions.sessions ?? []);
        this.mentorProfileForm.patchValue({
          telephone: profile.telephone ?? '',
          entreprise: profile.entreprise ?? '',
          poste: profile.poste ?? '',
          bio: profile.bio ?? ''
        });
      },
      error: error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de charger votre espace mentor.'
        ));
      }
    });
  }

  telechargerIcal(sessionId: string): void {
    this.mentoratService.telechargerIcal(sessionId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-mentorat-${sessionId}.ics`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.successMessage.set('Session exportée au format iCal (.ics) avec succès !');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => this.errorMessage.set('Erreur lors du téléchargement du fichier iCal')
    });
  }

  protected formatSessionDate(value?: string | null): string {
    if (!value) {
      return 'Date non renseignée';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Date non renseignée';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  protected voirProfil(userId: string, type: 'stagiaire' | 'mentor'): void {
    if (!userId) {
      this.errorMessage.set('Identifiant utilisateur introuvable.');
      return;
    }

    const request = (type === 'stagiaire'
      ? this.profileService.getStagiaireProfileById(userId)
      : this.profileService.getMentorProfileById(userId)) as Observable<any>;

    request.subscribe({
      next: (profile: any) => {
        const normalizedProfile = {
          ...profile,
          role: profile?.role ?? (type === 'stagiaire' ? 'STAGIAIRE' : 'MENTOR'),
          email: profile?.email ?? profile?.user?.email ?? 'Non renseigné',
          telephone: profile?.telephone ?? 'Non renseigné',
          ecole: profile?.ecole ?? 'Non renseigné',
          niveauEtudes: profile?.niveauEtudes ?? 'Non renseigné',
          entreprise: profile?.entreprise ?? 'Non renseigné',
          poste: profile?.poste ?? 'Non renseigné',
          bio: profile?.bio ?? 'Aucune bio renseignée.'
        };

        const title = type === 'stagiaire'
          ? `${normalizedProfile.prenom ?? ''} ${normalizedProfile.nom ?? ''}`.trim() || 'Profil stagiaire'
          : `${normalizedProfile.prenom ?? ''} ${normalizedProfile.nom ?? ''}`.trim() || 'Profil mentor';

        this.profilePreview.set({ title, data: normalizedProfile });
        this.showProfileModal.set(true);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger ce profil.');
      }
    });
  }

  protected fermerProfilModal(): void {
    this.showProfileModal.set(false);
    this.profilePreview.set(null);
  }

  protected telechargerCv(userId: string): void {
    this.cvService.telechargerPdfByUserId(userId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cv-${userId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.successMessage.set('CV téléchargé avec succès.');
        setTimeout(() => this.successMessage.set(null), 2500);
      },
      error: () => {
        this.errorMessage.set('Impossible de télécharger le CV.');
      }
    });
  }
}
