import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { catchError, finalize, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FormationsService } from '../../../../core/services/formations.service';
import { Formation, InscriptionFormation } from '../../../../core/interfaces/formation.interface';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Forum state
  selectedFormationForum = signal<{ id: string; titre: string } | null>(null);
  sujetsForum = signal<any[]>([]);
  showForumModal = signal(false);
  nouveauSujetTitre = signal('');
  nouveauSujetContenu = signal('');
  nouvelleReponseContenu = signal<Record<string, string>>({});

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

  inscrire(formation: Formation): void {
    this.formationsService.inscrire(formation.id).subscribe({
      next: () => {
        this.successMessage.set(`Inscription validée à la formation "${formation.titre}" !`);
        this.chargerDonnees();
        this.switchTab('mes-formations');
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: () => this.errorMessage.set('Erreur lors de l’inscription')
    });
  }

  avancerProgression(inscription: InscriptionFormation, ajout: number): void {
    const nouv = Math.min(100, (inscription.progression || 0) + ajout);
    const formationId = inscription.formationId || inscription.formation?.id;
    if (!formationId) return;

    this.formationsService.updateProgression(formationId, { progression: nouv, estTermine: nouv >= 100 }).subscribe({
      next: () => {
        this.chargerDonnees();
      }
    });
  }

  ouvrirForum(formation: Formation | InscriptionFormation): void {
    const fId = 'formation' in formation ? (formation.formation?.id || formation.formationId) : formation.id;
    const fTitre = 'formation' in formation ? (formation.formation?.titre || 'Formation') : formation.titre;
    if (!fId) return;

    this.selectedFormationForum.set({ id: fId, titre: fTitre });
    this.showForumModal.set(true);
    this.chargerForum(fId);
  }

  fermerForum(): void {
    this.showForumModal.set(false);
    this.selectedFormationForum.set(null);
  }

  chargerForum(formationId: string): void {
    this.formationsService.getForum(formationId).subscribe({
      next: (sujets) => this.sujetsForum.set(sujets || [])
    });
  }

  creerSujet(): void {
    const f = this.selectedFormationForum();
    if (!f || !this.nouveauSujetTitre().trim() || !this.nouveauSujetContenu().trim()) return;

    this.formationsService.creerSujet(f.id, {
      titre: this.nouveauSujetTitre(),
      contenu: this.nouveauSujetContenu()
    }).subscribe({
      next: () => {
        this.nouveauSujetTitre.set('');
        this.nouveauSujetContenu.set('');
        this.chargerForum(f.id);
      }
    });
  }

  repondreSujet(sujetId: string): void {
    const f = this.selectedFormationForum();
    const texte = this.nouvelleReponseContenu()[sujetId];
    if (!f || !texte?.trim()) return;

    this.formationsService.repondreSujet(f.id, sujetId, { contenu: texte }).subscribe({
      next: () => {
        const map = { ...this.nouvelleReponseContenu() };
        delete map[sujetId];
        this.nouvelleReponseContenu.set(map);
        this.chargerForum(f.id);
      }
    });
  }

  setReponseTexte(sujetId: string, val: string): void {
    this.nouvelleReponseContenu.set({
      ...this.nouvelleReponseContenu(),
      [sujetId]: val
    });
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
