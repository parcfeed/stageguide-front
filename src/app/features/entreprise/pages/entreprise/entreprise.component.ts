import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EntrepriseService } from '../../../../core/services/entreprise.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { CvService } from '../../../../core/services/cv.service';
import { OffreStage, OffreEmploi } from '../../../../core/interfaces/opportunites.interface';
import { Candidature } from '../../../../core/interfaces/candidature.interface';
import { Entretien } from '../../../../core/interfaces/entreprise.interface';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './entreprise.component.html',
  styleUrls: ['./entreprise.component.css']
})
export class EntrepriseComponent implements OnInit {
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly cvService = inject(CvService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Active view management
  activeTab = signal<'offres' | 'candidatures' | 'entretiens' | 'statistiques'>('offres');

  // Loading & Error States
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Lists
  offresStage = signal<OffreStage[]>([]);
  offresEmploi = signal<OffreEmploi[]>([]);
  candidatures = signal<Candidature[]>([]);
  entretiens = signal<Entretien[]>([]);
  statistiques = signal<any | null>(null);
  profilePreview = signal<{ title: string; data: any } | null>(null);

  // Modals / Form states
  showOfferForm = signal(false);
  isEditingOffer = signal(false);
  editingOfferId = signal<string | null>(null);
  editingOfferType = signal<'stage' | 'emploi' | null>(null);

  showInterviewForm = signal(false);
  selectedCandidature = signal<Candidature | null>(null);

  // Forms
  offerForm!: FormGroup;
  interviewForm!: FormGroup;

  constructor() {
    this.initForms();
  }

  ngOnInit(): void {
    // Check role before proceeding
    const user = this.authService.currentUser();
    if (user && user.role !== 'entreprise') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.refreshData();
  }

  private initForms(): void {
    this.offerForm = this.fb.group({
      type: ['stage', Validators.required],
      titre: ['', [Validators.required, Validators.minLength(2)]],
      ville: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      domaine: [''],
      duree: [''],
      typeContrat: ['CDI'],
      experience: [''],
      remote: [false],
      logoUrl: [''],
      dateExpiration: ['']
    });

    this.interviewForm = this.fb.group({
      dateProposee: ['', Validators.required],
      lieu: ['', Validators.required],
      message: ['']
    });

    // Toggle fields based on type
    this.offerForm.get('type')?.valueChanges.subscribe(type => {
      this.updateOfferValidators(type);
    });
  }

  private updateOfferValidators(type: 'stage' | 'emploi'): void {
    const dureeControl = this.offerForm.get('duree');
    const contractControl = this.offerForm.get('typeContrat');
    const expControl = this.offerForm.get('experience');

    if (type === 'stage') {
      dureeControl?.setValidators([Validators.required]);
      contractControl?.clearValidators();
      expControl?.clearValidators();
    } else {
      dureeControl?.clearValidators();
      contractControl?.setValidators([Validators.required]);
      expControl?.setValidators([Validators.required]);
    }

    dureeControl?.updateValueAndValidity();
    contractControl?.updateValueAndValidity();
    expControl?.updateValueAndValidity();
  }

  /**
   * Refreshes active tab data
   */
  refreshData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const tab = this.activeTab();

    if (tab === 'offres') {
      this.loadOffres();
    } else if (tab === 'candidatures') {
      this.loadCandidatures();
    } else if (tab === 'entretiens') {
      this.loadEntretiens();
    } else if (tab === 'statistiques') {
      this.loadStatistiques();
    }
  }

  private loadStatistiques(): void {
    this.entrepriseService.getStatistiques().subscribe({
      next: (stats) => {
        this.statistiques.set(stats);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des statistiques.');
        this.isLoading.set(false);
      }
    });
  }

  changerStatutCandidature(id: string, statut: string): void {
    this.entrepriseService.changerStatutCandidature(id, statut).subscribe({
      next: () => {
        this.successMessage.set(`Statut de la candidature mis à jour en "${statut}".`);
        this.loadCandidatures();
        setTimeout(() => this.successMessage.set(null), 3500);
      },
      error: () => this.errorMessage.set('Erreur lors de la mise à jour du statut.')
    });
  }

  changerStatutEntretien(id: string, statut: string): void {
    this.entrepriseService.changerStatutEntretien(id, statut).subscribe({
      next: () => {
        this.successMessage.set(`Statut de l'entretien mis à jour en "${statut}".`);
        this.loadEntretiens();
        setTimeout(() => this.successMessage.set(null), 3500);
      },
      error: () => this.errorMessage.set('Erreur lors de la mise à jour de l’entretien.')
    });
  }

  voirProfilStagiaire(userId: string): void {
    this.profileService.getStagiaireProfileById(userId).subscribe({
      next: (profile) => {
        this.profilePreview.set({
          title: `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim() || 'Profil stagiaire',
          data: profile
        });
      },
      error: () => this.errorMessage.set('Impossible de charger le profil du stagiaire.')
    });
  }

  telechargerCvStagiaire(userId: string): void {
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
      error: () => this.errorMessage.set('Impossible de télécharger le CV du stagiaire.')
    });
  }

  switchTab(tab: 'offres' | 'candidatures' | 'entretiens' | 'statistiques'): void {
    this.activeTab.set(tab);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.refreshData();
  }

  private loadOffres(): void {
    // Load both stages and jobs
    this.entrepriseService.listerOffresStage().subscribe({
      next: (stages) => {
        this.offresStage.set(stages || []);
        
        // Load jobs
        this.entrepriseService.listerOffresEmploi().subscribe({
          next: (jobs) => {
            this.offresEmploi.set(jobs || []);
            this.isLoading.set(false);
          },
          error: (err: any) => {
            this.errorMessage.set("Erreur de chargement des offres d'emploi.");
            this.isLoading.set(false);
          }
        });
      },
      error: (err: any) => {
        this.errorMessage.set("Erreur de chargement des offres de stage.");
        this.isLoading.set(false);
      }
    });
  }

  private loadCandidatures(): void {
    this.entrepriseService.listerCandidatures().subscribe({
      next: (data) => {
        this.candidatures.set(data || []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set('Erreur de chargement des candidatures.');
        this.isLoading.set(false);
      }
    });
  }

  private loadEntretiens(): void {
    this.entrepriseService.listerEntretiens().subscribe({
      next: (data) => {
        this.entretiens.set(data || []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set('Erreur de chargement des entretiens.');
        this.isLoading.set(false);
      }
    });
  }

  // --- Offers Management ---
  openCreateOffer(): void {
    this.isEditingOffer.set(false);
    this.editingOfferId.set(null);
    this.editingOfferType.set(null);
    this.offerForm.reset({
      type: 'stage',
      remote: false,
      typeContrat: 'CDI'
    });
    this.showOfferForm.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  openEditOffer(offer: OffreStage | OffreEmploi, type: 'stage' | 'emploi'): void {
    this.isEditingOffer.set(true);
    this.editingOfferId.set(offer.id);
    this.editingOfferType.set(type);

    const expDate = offer.dateExpiration ? new Date(offer.dateExpiration).toISOString().substring(0, 10) : '';

    if (type === 'stage') {
      const stage = offer as OffreStage;
      this.offerForm.patchValue({
        type: 'stage',
        titre: stage.titre,
        description: stage.description,
        ville: stage.ville,
        domaine: stage.domaine || '',
        duree: stage.duree || '',
        remote: stage.remote,
        logoUrl: stage.logoUrl || '',
        dateExpiration: expDate
      });
    } else {
      const job = offer as OffreEmploi;
      this.offerForm.patchValue({
        type: 'emploi',
        titre: job.titre,
        description: job.description,
        ville: job.ville,
        domaine: job.domaine || '',
        typeContrat: job.typeContrat || 'CDI',
        experience: job.experience || '',
        remote: job.remote,
        logoUrl: job.logoUrl || '',
        dateExpiration: expDate
      });
    }

    this.showOfferForm.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  closeOfferForm(): void {
    this.showOfferForm.set(false);
    this.isEditingOffer.set(false);
    this.editingOfferId.set(null);
    this.editingOfferType.set(null);
  }

  submitOffer(): void {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const formVal = this.offerForm.value;
    const type = formVal.type;

    const payload: any = {
      titre: formVal.titre,
      description: formVal.description,
      ville: formVal.ville,
      domaine: formVal.domaine || undefined,
      remote: formVal.remote,
      logoUrl: formVal.logoUrl || undefined,
      dateExpiration: formVal.dateExpiration ? new Date(formVal.dateExpiration).toISOString() : undefined
    };

    if (type === 'stage') {
      payload.duree = formVal.duree || undefined;
    } else {
      payload.typeContrat = formVal.typeContrat || undefined;
      payload.experience = formVal.experience || undefined;
    }

    if (this.isEditingOffer()) {
      const id = this.editingOfferId()!;
      const editType = this.editingOfferType()!;

      const req: Observable<any> = editType === 'stage'
        ? this.entrepriseService.modifierOffreStage(id, payload)
        : this.entrepriseService.modifierOffreEmploi(id, payload);

      req.subscribe({
        next: () => {
          this.successMessage.set('L’offre a été mise à jour avec succès.');
          this.showOfferForm.set(false);
          this.loadOffres();
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la modification de l’offre.');
          this.isLoading.set(false);
        }
      });
    } else {
      const req: Observable<any> = type === 'stage'
        ? this.entrepriseService.creerOffreStage(payload)
        : this.entrepriseService.creerOffreEmploi(payload);

      req.subscribe({
        next: () => {
          this.successMessage.set('L’offre a été publiée avec succès.');
          this.showOfferForm.set(false);
          this.loadOffres();
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création de l’offre.');
          this.isLoading.set(false);
        }
      });
    }
  }

  archiveOffer(offer: OffreStage | OffreEmploi, type: 'stage' | 'emploi'): void {
    if (!confirm('Êtes-vous sûr de vouloir archiver cette offre ?')) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const req: Observable<any> = type === 'stage'
      ? this.entrepriseService.archiverOffreStage(offer.id)
      : this.entrepriseService.archiverOffreEmploi(offer.id);

    req.subscribe({
      next: () => {
        this.successMessage.set('L’offre a été archivée.');
        this.loadOffres();
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de l’archivage.');
        this.isLoading.set(false);
      }
    });
  }

  // --- Interview Management ---
  openPlanInterview(candidature: Candidature): void {
    this.selectedCandidature.set(candidature);
    this.interviewForm.reset();
    this.showInterviewForm.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  closeInterviewForm(): void {
    this.showInterviewForm.set(false);
    this.selectedCandidature.set(null);
  }

  submitInterview(): void {
    if (this.interviewForm.invalid) {
      this.interviewForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formVal = this.interviewForm.value;
    const candidature = this.selectedCandidature()!;

    const payload = {
      candidatureId: candidature.id,
      dateProposee: new Date(formVal.dateProposee).toISOString(),
      lieu: formVal.lieu,
      message: formVal.message || undefined
    };

    this.entrepriseService.planifierEntretien(payload).subscribe({
      next: () => {
        this.successMessage.set('Entretien planifié avec succès !');
        this.showInterviewForm.set(false);
        this.selectedCandidature.set(null);
        this.refreshData(); // Refresh list to update
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de la planification.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
