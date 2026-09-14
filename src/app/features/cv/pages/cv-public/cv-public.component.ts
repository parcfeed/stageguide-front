import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CvService } from '../../../../core/services/cv.service';
import { CvStructure } from '../../../../core/interfaces/cv.interface';

@Component({
  selector: 'app-cv-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv-public.component.html',
  styleUrls: ['./cv-public.component.css']
})
export class CvPublicComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cvService = inject(CvService);

  cvData = signal<CvStructure | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.errorMessage.set('Token de partage invalide ou manquant.');
      this.isLoading.set(false);
      return;
    }

    this.cvService.getCvPublic(token).subscribe({
      next: (data) => {
        this.cvData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Ce lien de partage est expiré ou n’existe plus.');
        this.isLoading.set(false);
      }
    });
  }
}
