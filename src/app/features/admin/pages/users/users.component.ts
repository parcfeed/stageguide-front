import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of, forkJoin } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminUser } from '../../../../core/interfaces/admin.interface';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly roleFilter = signal('');
  protected readonly selectedUser = signal<AdminUser | null>(null);
  protected readonly showEditModal = signal(false);
  protected readonly userToDelete = signal<AdminUser | null>(null);
  protected readonly showDeleteModal = signal(false);

  protected readonly editForm = this.fb.nonNullable.group({
    email: ['', [Validators.email]],
    prenom: ['', [Validators.minLength(1)]],
    nom: ['', [Validators.minLength(1)]],
    role: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.charger();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected rechercher(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
    this.charger();
  }

  protected filtrerParRole(role: string): void {
    this.roleFilter.set(role);
    this.page.set(1);
    this.charger();
  }

  protected changerPage(p: number): void {
    this.page.set(p);
    this.charger();
  }

  protected openEdit(user: AdminUser): void {
    this.selectedUser.set(user);
    this.editForm.patchValue({
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
      isActive: user.isActive
    });
    this.showEditModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected closeEdit(): void {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
  }

  protected saveUser(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const val = this.editForm.getRawValue();
    const calls = [];

    if (val.role && val.role !== user.role) {
      calls.push(this.adminService.updateUserRole(user.id, val.role));
    }

    const updates: any = {};
    if (val.email && val.email !== user.email) updates.email = val.email;
    if (val.prenom && val.prenom !== user.prenom) updates.prenom = val.prenom;
    if (val.nom && val.nom !== user.nom) updates.nom = val.nom;
    if (Object.keys(updates).length > 0) {
      calls.push(this.adminService.updateUser(user.id, updates));
    }

    if (val.isActive !== user.isActive) {
      calls.push(this.adminService.updateUserStatus(user.id, val.isActive));
    }

    if (calls.length === 0) {
      this.closeEdit();
      this.isSaving.set(false);
      return;
    }

    forkJoin(calls).pipe(
      catchError(() => { this.errorMessage.set('Erreur lors de la mise à jour.'); return of(null); }),
      finalize(() => this.isSaving.set(false))
    ).subscribe(r => {
      if (r) {
        this.successMessage.set('Utilisateur mis à jour.');
        this.closeEdit();
        this.charger();
      }
    });
  }

  protected toggleStatus(user: AdminUser): void {
    const newStatus = !user.isActive;
    this.adminService.updateUserStatus(user.id, newStatus).pipe(
      catchError(() => { this.errorMessage.set('Erreur lors du changement de statut.'); return of(null); })
    ).subscribe(r => {
      if (r) this.charger();
    });
  }

  protected confirmDelete(user: AdminUser): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  protected deleteUser(): void {
    const user = this.userToDelete();
    if (!user) return;
    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.deleteUser(user.id).pipe(
      catchError(() => { this.errorMessage.set('Erreur lors de la suppression.'); return of(null); }),
      finalize(() => this.isDeleting.set(false))
    ).subscribe(r => {
      if (r !== null) {
        this.successMessage.set('Utilisateur supprimé.');
        this.cancelDelete();
        this.charger();
      }
    });
  }

  protected getRoleLabel(role: string): string {
    const map: Record<string, string> = { 'STAGIAIRE': 'Stagiaire', 'MENTOR': 'Mentor', 'ENTREPRISE': 'Entreprise', 'ADMIN': 'Admin', 'TUTEUR': 'Tuteur' };
    return map[role] || role;
  }

  protected getRoleClass(role: string): string {
    const map: Record<string, string> = { 'STAGIAIRE': 'role-stagiaire', 'MENTOR': 'role-mentor', 'ENTREPRISE': 'role-entreprise', 'ADMIN': 'role-admin' };
    return map[role] || '';
  }

  private charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const params: any = { page: this.page(), limit: 10 };
    if (this.searchQuery()) params.search = this.searchQuery();
    if (this.roleFilter()) params.role = this.roleFilter();
    this.adminService.listUsers(params).pipe(
      catchError(() => { this.errorMessage.set('Impossible de charger les utilisateurs.'); return of(null); }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(r => {
      if (r) { this.users.set(r.data); this.total.set(r.total); this.totalPages.set(r.totalPages); }
    });
  }
}
