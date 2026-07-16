import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CandidatureService } from '../../../../core/services/candidature.service';
import { Candidature, StatutCandidature } from '../../../../core/interfaces/candidature.interface';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-candidatures-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './candidatures-list.component.html',
  styleUrls: ['./candidatures-list.component.css']
})
export class CandidaturesListComponent implements OnInit {
  private readonly candidatureService = inject(CandidatureService);
  private readonly router = inject(Router);

  // States
  candidatures = signal<Candidature[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed stats for premium dashboard feel
  totalCount = computed(() => this.candidatures().length);
  pendingCount = computed(() => this.candidatures().filter(c => c.statut === StatutCandidature.EN_ATTENTE).length);
  inProgressCount = computed(() => this.candidatures().filter(c => c.statut === StatutCandidature.EN_COURS).length);
  acceptedCount = computed(() => this.candidatures().filter(c => c.statut === StatutCandidature.ACCEPTEE).length);

  ngOnInit(): void {
    this.chargerCandidatures();
  }

  /**
   * Load all applications
   */
  chargerCandidatures(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.candidatureService.listerCandidatures().subscribe({
      next: (data) => {
        this.candidatures.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossible de charger vos candidatures.');
        console.error('Error loading candidatures:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Helper to identify if candidature is for internship
   */
  isStage(candidature: Candidature): boolean {
    return !!candidature.offreStageId;
  }

  /**
   * Helper to format status text nicely in French
   */
  getStatusText(status: StatutCandidature): string {
    switch (status) {
      case StatutCandidature.EN_ATTENTE:
        return 'En attente';
      case StatutCandidature.EN_COURS:
        return 'En cours';
      case StatutCandidature.ACCEPTEE:
        return 'Acceptée';
      case StatutCandidature.REFUSEE:
        return 'Refusée';
      case StatutCandidature.ANNULEE:
        return 'Annulée';
      default:
        return status;
    }
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
