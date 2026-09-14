import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminOffreItem } from '../../../../core/interfaces/admin.interface';

@Component({
  selector: 'app-admin-offres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-offres.component.html',
  styleUrls: ['./admin-offres.component.css']
})
export class AdminOffresComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  offres = signal<AdminOffreItem[]>([]);
  isLoading = signal(true);
  filtreType = signal<'TOUT' | 'STAGE' | 'EMPLOI'>('TOUT');
  filtreRecherche = signal('');

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.chargerOffres();
  }

  chargerOffres(): void {
    this.isLoading.set(true);
    const typeParam = this.filtreType() === 'TOUT' ? undefined : this.filtreType().toLowerCase();

    this.adminService.listerOffres({
      type: typeParam,
      search: this.filtreRecherche() || undefined
    }).subscribe({
      next: (res) => {
        this.offres.set(res.offres || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des offres');
        this.isLoading.set(false);
      }
    });
  }

  validerOffre(offre: AdminOffreItem): void {
    const type = offre.type.toLowerCase() as 'stage' | 'emploi';
    this.adminService.validerOffre(type, offre.id).subscribe({
      next: () => {
        this.afficherSucces(`Offre "${offre.titre}" validée et publiée.`);
        this.chargerOffres();
      },
      error: () => this.errorMessage.set('Erreur lors de la validation de l’offre')
    });
  }

  archiverOffre(offre: AdminOffreItem): void {
    const type = offre.type.toLowerCase() as 'stage' | 'emploi';
    this.adminService.archiverOffre(type, offre.id).subscribe({
      next: () => {
        this.afficherSucces(`Offre "${offre.titre}" archivée.`);
        this.chargerOffres();
      },
      error: () => this.errorMessage.set('Erreur lors de l’archivage de l’offre')
    });
  }

  supprimerOffre(offre: AdminOffreItem): void {
    const type = offre.type.toLowerCase() as 'stage' | 'emploi';
    this.adminService.supprimerOffre(type, offre.id).subscribe({
      next: () => {
        this.afficherSucces(`Offre "${offre.titre}" supprimée.`);
        this.chargerOffres();
      },
      error: () => this.errorMessage.set('Erreur lors de la suppression de l’offre')
    });
  }

  private afficherSucces(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}
