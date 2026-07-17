import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OpportunitesService } from '../../../../core/services/opportunites.service';
import { CandidatureService } from '../../../../core/services/candidature.service';
import { OffreStage, OffreEmploi } from '../../../../core/interfaces/opportunites.interface';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-opportunites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './opportunites.component.html',
  styleUrls: ['./opportunites.component.css']
})
export class OpportunitesComponent implements OnInit {
  private readonly opportunitesService = inject(OpportunitesService);
  private readonly candidatureService = inject(CandidatureService);
  private readonly router = inject(Router);

  // Active tab management
  activeTab = signal<'stage' | 'emploi'>('stage');

  // State indicators
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Lists of offers
  offresStage = signal<OffreStage[]>([]);
  offresEmploi = signal<OffreEmploi[]>([]);

  // Filter models
  searchQuery = signal('');
  villeQuery = signal('');
  domaineQuery = signal('');
  remoteQuery = signal(false);

  // Detail Modal state
  selectedOffer = signal<OffreStage | OffreEmploi | null>(null);
  showDetailModal = signal(false);

  // Motivation & Application state
  motivationMessage = signal('');
  isApplying = signal(false);
  applySuccessMessage = signal<string | null>(null);
  applyErrorMessage = signal<string | null>(null);

  // Modal logo error state
  modalLogoError = signal(false);

  // Getter helper to bypass template strict typing for union types
  get selectedOfferAsAny(): any {
    return this.selectedOffer();
  }

  // Preset domains for filtering
  domainsList = [
    'Développement Web',
    'Développement Mobile',
    'Design / UI/UX',
    'Data Science / IA',
    'Marketing Digital',
    'Gestion de Projet',
    'Réseaux & Sécurité'
  ];

  ngOnInit(): void {
    this.rechercher();
  }

  /**
   * Main search method
   */
  rechercher(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const isStage = this.activeTab() === 'stage';

    if (isStage) {
      this.opportunitesService.listerOffresStage({
        search: this.searchQuery() || undefined,
        ville: this.villeQuery() || undefined,
        domaine: this.domaineQuery() || undefined,
        remote: this.remoteQuery() || undefined
      }).subscribe({
        next: (res) => {
          this.offresStage.set(res.offres || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Impossible de charger les offres de stage.');
          console.error('Error loading internships:', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.opportunitesService.listerOffresEmploi({
        search: this.searchQuery() || undefined,
        ville: this.villeQuery() || undefined,
        domaine: this.domaineQuery() || undefined,
        remote: this.remoteQuery() || undefined
      }).subscribe({
        next: (res) => {
          this.offresEmploi.set(res.offres || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set("Impossible de charger les offres d'emploi.");
          console.error('Error loading jobs:', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * Reset all search query variables
   */
  reinitialiser(): void {
    this.searchQuery.set('');
    this.villeQuery.set('');
    this.domaineQuery.set('');
    this.remoteQuery.set(false);
    this.rechercher();
  }

  /**
   * Switch between stages and emplois
   */
  switchTab(tab: 'stage' | 'emploi'): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.rechercher();
  }

  /**
   * Open the detailed modal view for an offer
   */
  ouvrirDetail(offre: OffreStage | OffreEmploi): void {
    this.selectedOffer.set(offre);
    this.showDetailModal.set(true);
    this.modalLogoError.set(false);
    // Reset apply states
    this.motivationMessage.set('');
    this.applySuccessMessage.set(null);
    this.applyErrorMessage.set(null);
    this.isApplying.set(false);
  }

  /**
   * Close the detailed modal view
   */
  fermerDetail(): void {
    this.showDetailModal.set(false);
    this.selectedOffer.set(null);
    this.motivationMessage.set('');
    this.applySuccessMessage.set(null);
    this.applyErrorMessage.set(null);
    this.isApplying.set(false);
  }

  /**
   * Apply for the currently selected offer
   */
  postuler(): void {
    const offer = this.selectedOffer();
    if (!offer || this.isApplying()) return;

    this.isApplying.set(true);
    this.applySuccessMessage.set(null);
    this.applyErrorMessage.set(null);

    const isStage = this.activeTab() === 'stage';
    const payload: any = {};

    if (isStage) {
      payload.offreStageId = offer.id;
    } else {
      payload.offreEmploiId = offer.id;
    }

    if (this.motivationMessage().trim()) {
      payload.message = this.motivationMessage();
    }

    this.candidatureService.creerCandidature(payload).pipe(
      catchError(err => {
        const msg = err.error?.message || "Une erreur est survenue lors de l'envoi de votre candidature.";
        this.applyErrorMessage.set(msg);
        this.isApplying.set(false);
        return of(null);
      })
    ).subscribe(candidature => {
      if (candidature) {
        this.applySuccessMessage.set('Votre candidature a été envoyée avec succès !');
        this.motivationMessage.set('');
        this.isApplying.set(false);
      }
    });
  }

  /**
   * Handle broken modal logo image
   */
  setLogoError(): void {
    this.modalLogoError.set(true);
  }

  /**
   * Navigate back to the dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
