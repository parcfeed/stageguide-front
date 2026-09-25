import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OpportunitesService } from '../../../../core/services/opportunites.service';
import { CandidatureService } from '../../../../core/services/candidature.service';
import {
  AlerteRecherche,
  OffreEmploi,
  OffreSauvegardee,
  OffreStage,
  TypeOffre
} from '../../../../core/interfaces/opportunites.interface';
import { catchError, forkJoin, of } from 'rxjs';

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
  activeTab = signal<'stage' | 'emploi' | 'recommandations' | 'favoris' | 'alertes'>('stage');

  // State indicators
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Lists of offers
  offresStage = signal<OffreStage[]>([]);
  offresEmploi = signal<OffreEmploi[]>([]);
  recommandationsStage = signal<OffreStage[]>([]);
  recommandationsEmploi = signal<OffreEmploi[]>([]);
  offresSauvegardees = signal<OffreSauvegardee[]>([]);
  // Index offre.id -> sauvegarde.id : permet de savoir si une offre est en favori
  private readonly favorisIndex = signal<Record<string, string>>({});

  // Alertes
  alertes = signal<AlerteRecherche[]>([]);
  nouvelleAlerteDomaine = signal('');
  nouvelleAlerteVille = signal('');

  // Filter models
  searchQuery = signal('');
  villeQuery = signal('');
  domaineQuery = signal('');
  remoteQuery = signal(false);

  // Detail Modal state
  selectedOffer = signal<OffreStage | OffreEmploi | null>(null);
  selectedTypeOffre = signal<TypeOffre>('STAGE');
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
    // Chargés dès l'ouverture pour connaître l'état des boutons favoris et le nombre d'alertes
    this.chargerFavoris();
    this.chargerAlertes();
  }

  /**
   * Main search method
   */
  rechercher(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const tab = this.activeTab();

    if (tab === 'recommandations') {
      // Un échec sur un des deux types ne doit pas masquer l'autre
      forkJoin({
        stages: this.opportunitesService.getRecommandationsStage().pipe(catchError(() => of([]))),
        emplois: this.opportunitesService.getRecommandationsEmploi().pipe(catchError(() => of([])))
      }).subscribe(({ stages, emplois }) => {
        this.recommandationsStage.set(stages);
        this.recommandationsEmploi.set(emplois);
        this.isLoading.set(false);
      });
      return;
    }

    if (tab === 'favoris') {
      this.chargerFavoris();
      this.isLoading.set(false);
      return;
    }

    if (tab === 'alertes') {
      this.chargerAlertes();
      this.isLoading.set(false);
      return;
    }

    if (tab === 'stage') {
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
   * Sauvegarder ou retirer des favoris
   */
  /**
   * Recharge les favoris et reconstruit l'index offre -> sauvegarde
   */
  chargerFavoris(): void {
    this.opportunitesService.listerOffresSauvegardees().subscribe({
      next: (favoris) => {
        this.offresSauvegardees.set(favoris);
        const index: Record<string, string> = {};
        for (const favori of favoris) {
          const offreId = favori.offreStageId ?? favori.offreEmploiId;
          if (offreId) {
            index[offreId] = favori.id;
          }
        }
        this.favorisIndex.set(index);
      },
      error: () => {
        // On ne bloque pas l'affichage des offres si les favoris échouent
        if (this.activeTab() === 'favoris') {
          this.errorMessage.set('Erreur lors du chargement des offres sauvegardées');
        }
      }
    });
  }

  estFavori(offreId: string): boolean {
    return Boolean(this.favorisIndex()[offreId]);
  }

  /**
   * Ajoute ou retire une offre des favoris selon son état actuel
   */
  toggleFavori(offre: OffreStage | OffreEmploi, type: TypeOffre, event: Event): void {
    event.stopPropagation();
    const sauvegardeId = this.favorisIndex()[offre.id];

    if (sauvegardeId) {
      this.supprimerFavori(sauvegardeId, event);
      return;
    }

    const payload = type === 'STAGE' ? { offreStageId: offre.id } : { offreEmploiId: offre.id };
    this.opportunitesService.sauvegarderOffre(payload).subscribe({
      next: () => {
        this.chargerFavoris();
        this.afficherSucces('Offre ajoutée aux favoris !');
      },
      error: () => {}
    });
  }

  supprimerFavori(sauvegardeId: string, event: Event): void {
    event.stopPropagation();
    this.opportunitesService.supprimerOffreSauvegardee(sauvegardeId).subscribe({
      next: () => {
        this.chargerFavoris();
        this.afficherSucces('Offre retirée des favoris.');
      },
      error: () => {}
    });
  }

  /**
   * Offre associée à une sauvegarde (null si l'offre a été supprimée)
   */
  offreDuFavori(favori: OffreSauvegardee): OffreStage | OffreEmploi | null {
    return favori.offreStage ?? favori.offreEmploi ?? null;
  }

  typeDuFavori(favori: OffreSauvegardee): TypeOffre {
    return favori.offreStage ? 'STAGE' : 'EMPLOI';
  }

  private afficherSucces(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  // --- Alertes ---
  chargerAlertes(): void {
    this.opportunitesService.listerAlertes().subscribe({
      next: (res) => this.alertes.set(res || [])
    });
  }

  creerAlerte(): void {
    this.opportunitesService.creerAlerte({
      domaine: this.nouvelleAlerteDomaine() || undefined,
      ville: this.nouvelleAlerteVille() || undefined
    }).subscribe({
      next: () => {
        this.nouvelleAlerteDomaine.set('');
        this.nouvelleAlerteVille.set('');
        this.chargerAlertes();
      }
    });
  }

  supprimerAlerte(id: string): void {
    this.opportunitesService.supprimerAlerte(id).subscribe({
      next: () => this.chargerAlertes()
    });
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
  switchTab(tab: 'stage' | 'emploi' | 'recommandations' | 'favoris' | 'alertes'): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.rechercher();
  }

  /**
   * Open the detailed modal view for an offer
   */
  ouvrirDetail(offre: OffreStage | OffreEmploi, type: TypeOffre): void {
    this.selectedOffer.set(offre);
    this.selectedTypeOffre.set(type);
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

    const isStage = this.selectedTypeOffre() === 'STAGE';
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
