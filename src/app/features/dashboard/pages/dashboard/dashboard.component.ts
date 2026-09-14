import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { User } from '../../../../core/interfaces/user.interface';
import { StagiaireDashboard } from '../../../../core/interfaces/dashboard.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  protected readonly user = signal<User | null>(null);
  protected readonly dashboard = signal<StagiaireDashboard | null>(null);
  protected readonly calendrier = signal<any[]>([]);
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

  protected readonly filteredSteps = computed(() => {
    const prog = this.dashboard()?.progressionProfil;
    if (!prog) return [];
    const seen = new Set<string>();
    return prog.etapes.filter(step => {
      const label = step.label.toLowerCase();
      if (label.includes('cv') || label.includes('compét') || label.includes('compet')) return false;
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  });

  protected readonly adjustedProgressPct = computed(() => {
    const steps = this.filteredSteps();
    if (steps.length === 0) return 0;
    const doneCount = steps.filter(s => s.done).length;
    return Math.round((doneCount / steps.length) * 100);
  });

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      if (this.handleRoleRedirect(currentUser)) {
        return;
      }
      this.loadDashboardFor(currentUser);
      return;
    }

    this.authService.loadCurrentUser().pipe(
      tap(user => {
        this.user.set(user);
        this.handleRoleRedirect(user);
      }),
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

  private handleRoleRedirect(user: User): boolean {
    if (user.role === 'entreprise') {
      this.router.navigate(['/entreprise']);
      return true;
    }
    if (user.role === 'mentor') {
      this.router.navigate(['/mentor/mentorat']);
      return true;
    }
    return false;
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

    this.dashboardService.getCalendrier().subscribe({
      next: (res) => this.calendrier.set(res.evenements || [])
    });
  }

  private loadDashboardRequest(user: User): Observable<StagiaireDashboard | null> {
    if (user.role !== 'stagiaire') {
      return of(null);
    }

    return this.dashboardService.getStagiaireDashboard();
  }
}
