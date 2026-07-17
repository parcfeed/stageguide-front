import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { ConventionsService } from '../../../../core/services/conventions.service';
import { Convention } from '../../../../core/interfaces/convention.interface';

@Component({
  selector: 'app-conventions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './conventions.component.html',
  styleUrls: ['./conventions.component.css']
})
export class ConventionsComponent implements OnInit {
  private readonly conventionsService = inject(ConventionsService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly conventions = signal<Convention[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly showCreateModal = signal(false);

  protected readonly conventionForm = this.fb.nonNullable.group({
    entrepriseNom: ['', [Validators.required, Validators.minLength(1)]],
    mentorNom: [''],
    dateDebut: [''],
    dateFin: ['']
  });

  ngOnInit(): void {
    this.charger();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected openForm(): void {
    this.showCreateModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected closeForm(): void {
    this.showCreateModal.set(false);
    this.conventionForm.reset();
  }

  protected onSubmit(): void {
    if (this.conventionForm.invalid) {
      this.conventionForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const val = this.conventionForm.getRawValue();
    this.conventionsService.creer({
      entrepriseNom: val.entrepriseNom,
      mentorNom: val.mentorNom || undefined,
      dateDebut: val.dateDebut || undefined,
      dateFin: val.dateFin || undefined
    }).pipe(
      catchError(err => {
        this.errorMessage.set('Erreur lors de la création de la convention.');
        return of(null);
      }),
      finalize(() => this.isSaving.set(false))
    ).subscribe(response => {
      if (response) {
        this.successMessage.set('Convention créée avec succès.');
        this.closeForm();
        this.charger();
      }
    });
  }

  protected getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'EN_ATTENTE_SIGNATURE': 'En attente de signature',
      'SIGNEE': 'Signée',
      'REFUSEE': 'Refusée',
      'ANNULEE': 'Annulée'
    };
    return map[statut] || statut;
  }

  protected getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'BROUILLON': 'status-pending',
      'EN_ATTENTE_SIGNATURE': 'status-inprogress',
      'SIGNEE': 'status-accepted',
      'REFUSEE': 'status-refused',
      'ANNULEE': 'status-cancelled'
    };
    return map[statut] || '';
  }

  protected getStatutDescription(statut: string): string {
    const map: Record<string, string> = {
      'BROUILLON': 'Cette convention est en cours de rédaction et n\'a pas encore été soumise.',
      'EN_ATTENTE_SIGNATURE': 'Cette convention a été soumise et est en attente de signature.',
      'SIGNEE': 'Cette convention a été signée par toutes les parties.',
      'REFUSEE': 'Cette convention a été refusée.',
      'ANNULEE': 'Cette convention a été annulée.'
    };
    return map[statut] || '';
  }

  protected formatDate(dateStr?: string): string {
    if (!dateStr) return 'Non définie';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.conventionsService.lister().pipe(
      catchError(() => { this.errorMessage.set('Impossible de charger les conventions.'); return of(null); }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(r => { if (r) this.conventions.set(r.conventions); });
  }
}
