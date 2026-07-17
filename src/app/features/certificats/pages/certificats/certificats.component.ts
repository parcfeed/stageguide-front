import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { catchError, finalize, of } from 'rxjs';
import { CertificatsService } from '../../../../core/services/certificats.service';
import { Certificat } from '../../../../core/interfaces/certificat.interface';

@Component({
  selector: 'app-certificats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificats.component.html',
  styleUrl: './certificats.component.css'
})
export class CertificatsComponent implements OnInit {
  private readonly certificatsService = inject(CertificatsService);
  private readonly location = inject(Location);

  protected readonly certificats = signal<Certificat[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.certificatsService.lister().pipe(
      catchError(() => { this.errorMessage.set('Impossible de charger les certificats.'); return of(null); }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(r => { if (r) this.certificats.set(r.certificats); });
  }
}
