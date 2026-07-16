import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';
import { FichiersService } from '../../../../core/services/fichiers.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Fichier,
  TypeDocument,
} from '../../../../core/interfaces/fichier.interface';

@Component({
  selector: 'app-fichiers',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ReactiveFormsModule],
  templateUrl: './fichiers.component.html',
  styleUrl: './fichiers.component.css',
})
export class FichiersComponent implements OnInit {
  private readonly fichiersService = inject(FichiersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly isUploading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly fichiers = signal<Fichier[]>([]);
  protected readonly showUploadForm = signal(false);

  protected readonly typeDocumentLabels: Record<TypeDocument, string> = {
    CV: 'CV',
    LETTRE_MOTIVATION: 'Lettre de motivation',
    CONVENTION: 'Convention',
    ATTESTATION: 'Attestation',
    CERTIFICAT: 'Certificat',
    AUTRE: 'Autre',
  };

  protected readonly uploadForm = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(1)]],
    typeMime: ['', [Validators.required, Validators.minLength(1)]],
    url: [''],
    typeDocument: ['AUTRE' as TypeDocument],
    tailleOctets: [0],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.loadFichiers();
      return;
    }
    this.authService.loadCurrentUser().subscribe({
      next: () => this.loadFichiers(),
      error: () => {
        this.errorMessage.set('Impossible de charger votre session.');
        this.isLoading.set(false);
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  protected toggleUploadForm(): void {
    this.showUploadForm.update(v => !v);
    if (!this.showUploadForm()) {
      this.uploadForm.reset({ typeDocument: 'AUTRE', tailleOctets: 0 });
    }
  }

  protected onSubmit(): void {
    if (this.uploadForm.invalid) return;

    const raw = this.uploadForm.getRawValue();
    const payload: Record<string, unknown> = {
      nom: raw.nom,
      typeMime: raw.typeMime,
      typeDocument: raw.typeDocument,
    };
    if (raw.url) payload['url'] = raw.url;
    if (raw.tailleOctets && raw.tailleOctets > 0)
      payload['tailleOctets'] = raw.tailleOctets;

    this.isUploading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.fichiersService
      .enregistrerFichier(payload as any)
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Fichier enregistré avec succès.');
          this.showUploadForm.set(false);
          this.uploadForm.reset({ typeDocument: 'AUTRE', tailleOctets: 0 });
          this.loadFichiers();
        },
        error: error => {
          this.errorMessage.set(
            this.authService.getErrorMessage(
              error,
              "Impossible d'enregistrer le fichier."
            )
          );
        },
      });
  }

  protected getTypeLabel(type: TypeDocument): string {
    return this.typeDocumentLabels[type] ?? type;
  }

  protected formatSize(octets: number | null): string {
    if (octets === null || octets === 0) return '-';
    const ko = octets / 1024;
    if (ko < 1024) return `${ko.toFixed(1)} Ko`;
    const mo = ko / 1024;
    return `${mo.toFixed(1)} Mo`;
  }

  protected getMimeIcon(typeMime: string): string {
    if (typeMime.includes('pdf')) return '📄';
    if (typeMime.includes('image')) return '🖼️';
    if (typeMime.includes('word') || typeMime.includes('document'))
      return '📝';
    if (typeMime.includes('sheet') || typeMime.includes('excel'))
      return '📊';
    if (typeMime.includes('zip') || typeMime.includes('rar'))
      return '🗜️';
    return '📎';
  }

  private loadFichiers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.fichiersService
      .listerFichiers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.fichiers.set(response.fichiers ?? []);
        },
        error: error => {
          this.errorMessage.set(
            this.authService.getErrorMessage(
              error,
              'Impossible de charger vos fichiers.'
            )
          );
        },
      });
  }
}
