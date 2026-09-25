import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = this.authService.currentUser;

  readonly activeTab = signal<'etudiants' | 'entreprises' | 'mentors'>('etudiants');
  readonly isMobileMenuOpen = signal(false);

  readonly userDashboardRoute = computed(() => {
    const user = this.currentUser();
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'mentor':
        return '/mentor/mentorat';
      case 'entreprise':
        return '/entreprise';
      case 'admin':
        return '/admin';
      case 'stagiaire':
      default:
        return '/dashboard';
    }
  });

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  setTab(tab: 'etudiants' | 'entreprises' | 'mentors'): void {
    this.activeTab.set(tab);
  }
}
