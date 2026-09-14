import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: string[];
}

const ALL_ROUTES: NavItem[] = [
  { label: 'Tableau de bord', route: '/dashboard', icon: 'dashboard', roles: ['stagiaire'] },
  { label: 'Mon CV', route: '/cv', icon: 'badge', roles: ['stagiaire'] },
  { label: 'Profil', route: '/profile', icon: 'person', roles: ['stagiaire', 'mentor'] },
  { label: 'Portfolio', route: '/portfolio', icon: 'work', roles: ['stagiaire'] },
  { label: 'Opportunités', route: '/opportunites', icon: 'search', roles: ['stagiaire'] },
  { label: 'Candidatures', route: '/candidatures', icon: 'assignment', roles: ['stagiaire'] },
  { label: 'Mes Formations', route: '/formations', icon: 'auto_stories', roles: ['stagiaire'] },
  { label: 'Mes Certificats', route: '/certificats', icon: 'verified', roles: ['stagiaire'] },
  { label: 'Mes Conventions', route: '/conventions', icon: 'description', roles: ['stagiaire'] },
  { label: 'Mentorat', route: '/stagiaire/mentorat', icon: 'handshake', roles: ['stagiaire'] },
  { label: 'Mentorat', route: '/mentor/mentorat', icon: 'handshake', roles: ['mentor'] },
  { label: 'Réseau', route: '/reseau', icon: 'hub', roles: ['stagiaire', 'mentor', 'entreprise'] },
  { label: 'Recruteur', route: '/entreprise', icon: 'corporate_fare', roles: ['entreprise'] },
  { label: 'Messages', route: '/messages', icon: 'chat', roles: ['stagiaire', 'mentor', 'entreprise'] },
  { label: 'Fichiers', route: '/fichiers', icon: 'folder', roles: ['stagiaire', 'mentor', 'entreprise'] },
  { label: 'Notifications', route: '/notifications', icon: 'notifications', roles: ['stagiaire', 'mentor', 'entreprise'] },
  { label: 'Dashboard', route: '/admin', icon: 'dashboard', roles: ['admin'] },
  { label: 'Utilisateurs', route: '/admin/users', icon: 'group', roles: ['admin'] },
  { label: 'Partenaires', route: '/admin/partners', icon: 'business', roles: ['admin'] },
  { label: 'Modération Offres', route: '/admin/offres', icon: 'fact_check', roles: ['admin'] },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isCollapsed = signal(false);
  readonly isMobileOpen = signal(false);
  readonly isLoggingOut = signal(false);

  get navItems(): NavItem[] {
    const user = this.currentUser();
    if (!user) return [];
    return ALL_ROUTES.filter(item => item.roles.includes(user.role));
  }

  toggleCollapse(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  toggleMobile(): void {
    this.isMobileOpen.set(!this.isMobileOpen());
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  logout(): void {
    this.isLoggingOut.set(true);
    this.authService.logout().pipe(
      finalize(() => {
        this.isLoggingOut.set(false);
        this.closeMobile();
      })
    ).subscribe();
  }
}
