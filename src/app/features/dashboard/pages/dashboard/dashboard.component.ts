import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { User } from '../../../../core/interfaces/user.interface';
import { StagiaireDashboard } from '../../../../core/interfaces/dashboard.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  protected readonly user = signal<User | null>(null);
  protected readonly dashboard = signal<StagiaireDashboard | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoggingOut = signal(false);

  protected readonly displayName = computed(() => {
    const currentUser = this.user();

    if (!currentUser) {
      return 'Votre espace';
    }

    return `${currentUser.prenom} ${currentUser.nom}`.trim();
  });

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      this.loadDashboardFor(currentUser);
      return;
    }

    this.authService.loadCurrentUser().pipe(
      tap(user => this.user.set(user)),
      switchMap(user => this.loadDashboardRequest(user)),
      catchError(error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de charger le tableau de bord.'
        ));
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(dashboard => {
      if (dashboard) {
        this.dashboard.set(dashboard);
      }
    });
  }

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authService.logout().pipe(
      finalize(() => this.isLoggingOut.set(false))
    ).subscribe();
  }

  private loadDashboardFor(user: User): void {
    this.user.set(user);

    this.loadDashboardRequest(user).pipe(
      catchError(error => {
        this.errorMessage.set(this.authService.getErrorMessage(
          error,
          'Impossible de charger le tableau de bord.'
        ));
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(dashboard => {
      if (dashboard) {
        this.dashboard.set(dashboard);
      }
    });
  }

  private loadDashboardRequest(user: User): Observable<StagiaireDashboard | null> {
    if (user.role !== 'stagiaire') {
      this.errorMessage.set('Le tableau de bord disponible pour ce module concerne les stagiaires.');
      return of(null);
    }

    return this.dashboardService.getStagiaireDashboard();
  }
}
