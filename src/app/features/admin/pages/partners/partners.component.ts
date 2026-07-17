import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminPartner } from '../../../../core/interfaces/admin.interface';

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class AdminPartnersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly partners = signal<AdminPartner[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly showModal = signal(false);
  protected readonly editingPartner = signal<AdminPartner | null>(null);
  protected readonly partnerToDelete = signal<AdminPartner | null>(null);
  protected readonly showDeleteModal = signal(false);

  protected readonly partnerForm = this.fb.nonNullable.group({
    nomEntreprise: ['', [Validators.required]],
    ville: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    lienSiteWeb: ['']
  });

  ngOnInit(): void {
    this.charger();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected openCreate(): void {
    this.editingPartner.set(null);
    this.partnerForm.reset();
    this.showModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected openEdit(partner: AdminPartner): void {
    this.editingPartner.set(partner);
    this.partnerForm.patchValue(partner);
    this.showModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected cancelForm(): void {
    this.showModal.set(false);
    this.editingPartner.set(null);
  }

  protected onSubmit(): void {
    if (this.partnerForm.invalid) { this.partnerForm.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const val = this.partnerForm.getRawValue();

    const obs = this.editingPartner()
      ? this.adminService.updatePartner(this.editingPartner()!.id, val)
      : this.adminService.createPartner(val);

    obs.pipe(
      catchError(() => { this.errorMessage.set('Erreur lors de l\'enregistrement.'); return of(null); }),
      finalize(() => this.isSaving.set(false))
    ).subscribe(r => {
      if (r) {
        this.successMessage.set(this.editingPartner() ? 'Partenaire mis à jour.' : 'Partenaire créé.');
        this.cancelForm();
        this.charger();
      }
    });
  }

  protected confirmDelete(partner: AdminPartner): void {
    this.partnerToDelete.set(partner);
    this.showDeleteModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.partnerToDelete.set(null);
  }

  protected deletePartner(): void {
    const partner = this.partnerToDelete();
    if (!partner) return;
    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.deletePartner(partner.id).pipe(
      catchError(() => { this.errorMessage.set('Erreur lors de la suppression.'); return of(null); }),
      finalize(() => this.isDeleting.set(false))
    ).subscribe(r => {
      if (r !== null) {
        this.successMessage.set('Partenaire supprimé.');
        this.cancelDelete();
        this.charger();
      }
    });
  }

  private charger(): void {
    this.isLoading.set(true);
    this.adminService.listPartners().pipe(
      catchError(() => { this.errorMessage.set('Impossible de charger les partenaires.'); return of(null); }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(r => { if (r) this.partners.set(r); });
  }
}
