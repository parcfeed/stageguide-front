import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CvService } from '../../../../core/services/cv.service';
import { CvStructure, CvPartageResponse } from '../../../../core/interfaces/cv.interface';

@Component({
  selector: 'app-cv-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv-view.component.html',
  styleUrls: ['./cv-view.component.css']
})
export class CvViewComponent implements OnInit {
  private readonly cvService = inject(CvService);
  private readonly router = inject(Router);

  cvData = signal<CvStructure | null>(null);
  partageInfo = signal<CvPartageResponse | null>(null);

  isLoading = signal(true);
  isDownloading = signal(false);
  isGeneratingLink = signal(false);
  copied = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.chargerCv();
  }

  chargerCv(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.cvService.getMonCv().subscribe({
      next: (data) => {
        this.cvData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors du chargement de votre CV dynamique');
        this.isLoading.set(false);
      }
    });
  }

  telechargerPdf(): void {
    this.isDownloading.set(true);
    this.cvService.telechargerPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${this.cvData()?.prenom || 'Stagiaire'}_${this.cvData()?.nom || ''}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: () => {
        this.isDownloading.set(false);
        this.errorMessage.set('Erreur lors de la génération du PDF');
      }
    });
  }

  genererLienPartage(): void {
    this.isGeneratingLink.set(true);
    this.cvService.genererLienPartage().subscribe({
      next: (res) => {
        this.partageInfo.set(res);
        this.isGeneratingLink.set(false);
      },
      error: () => {
        this.isGeneratingLink.set(false);
        this.errorMessage.set('Erreur lors de la génération du lien public');
      }
    });
  }

  copierLien(): void {
    const info = this.partageInfo();
    if (!info) return;

    const fullUrl = `${window.location.origin}/cv/partage/${info.token}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    });
  }

  editerPortfolio(): void {
    this.router.navigate(['/portfolio']);
  }
}
