import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { catchError, finalize, of } from 'rxjs';
import { FormationsService } from '../../../../core/services/formations.service';
import { Formation, InscriptionFormation } from '../../../../core/interfaces/formation.interface';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formations.component.html',
  styleUrl: './formations.component.css'
})
export class FormationsComponent implements OnInit {
  private readonly formationsService = inject(FormationsService);
  private readonly location = inject(Location);

  protected readonly catalogue = signal<Formation[]>([]);
  protected readonly mesInscriptions = signal<InscriptionFormation[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly activeTab = signal<'catalogue' | 'mes-formations'>('mes-formations');
  protected readonly searchQuery = signal('');

  protected readonly catalogueFiltre = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.catalogue();
    return this.catalogue().filter(f =>
      f.titre.toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q) ||
      (f.domaine || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.chargerDonnees();
  }

  switchTab(tab: 'catalogue' | 'mes-formations'): void {
    this.activeTab.set(tab);
    if (tab === 'catalogue' && this.catalogue().length === 0) {
      this.chargerCatalogue();
    }
  }

  rechercher(value: string): void {
    this.searchQuery.set(value);
  }

  protected goBack(): void {
    this.location.back();
  }

  protected getStatutLabel(progression: number): string {
    if (progression === 0) return 'Non commencée';
    if (progression >= 100) return 'Terminée';
    return `${progression}%`;
  }

  protected getNiveauLabel(niveau?: string): string {
    if (!niveau) return 'Général';
    const map: Record<string, string> = {
      'debutant': 'Débutant', 'intermediaire': 'Intermédiaire',
      'avance': 'Avancé', 'expert': 'Expert'
    };
    return map[niveau.toLowerCase()] || niveau;
  }

  private chargerDonnees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.formationsService.listerMesFormations().pipe(
      catchError(() => { this.errorMessage.set('Impossible de charger les formations.'); return of(null); }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(r => { if (r) this.mesInscriptions.set(r.inscriptions); });
  }

  private chargerCatalogue(): void {
    this.formationsService.listerCatalogue().pipe(
      catchError(() => { this.errorMessage.set('Aucune formation disponible pour le moment.'); return of(null); })
    ).subscribe(r => { if (r) this.catalogue.set(r.formations); });
  }
}
