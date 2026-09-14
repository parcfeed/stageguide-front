import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './core/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire', 'mentor'] },
        loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'cv',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/cv/pages/cv-view/cv-view.component').then(m => m.CvViewComponent)
      },
      {
        path: 'portfolio',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/portfolio/pages/portfolio/portfolio.component').then(m => m.PortfolioComponent)
      },
      {
        path: 'opportunites',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/opportunites/pages/opportunites/opportunites.component').then(m => m.OpportunitesComponent)
      },
      {
        path: 'candidatures',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/candidatures/pages/candidatures-list/candidatures-list.component').then(m => m.CandidaturesListComponent)
      },
      {
        path: 'formations',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/formations/pages/formations/formations.component').then(m => m.FormationsComponent)
      },
      {
        path: 'certificats',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/certificats/pages/certificats/certificats.component').then(m => m.CertificatsComponent)
      },
      {
        path: 'conventions',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/conventions/pages/conventions/conventions.component').then(m => m.ConventionsComponent)
      },
      {
        path: 'entreprise',
        canActivate: [roleGuard],
        data: { roles: ['entreprise'] },
        loadComponent: () => import('./features/entreprise/pages/entreprise/entreprise.component').then(m => m.EntrepriseComponent)
      },
      {
        path: 'stagiaire/mentorat',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire'] },
        loadComponent: () => import('./features/mentorat/pages/mentorat/mentorat.component').then(m => m.MentoratComponent)
      },
      {
        path: 'mentor/mentorat',
        canActivate: [roleGuard],
        data: { roles: ['mentor'] },
        loadComponent: () => import('./features/mentorat/pages/mentorat/mentorat.component').then(m => m.MentoratComponent)
      },
      {
        path: 'mentorat',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire', 'mentor'] },
        loadComponent: () => import('./features/mentorat/pages/mentorat/mentorat.component').then(m => m.MentoratComponent)
      },
      {
        path: 'reseau',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire', 'mentor', 'entreprise'] },
        loadComponent: () => import('./features/reseau/pages/reseau/reseau.component').then(m => m.ReseauComponent)
      },
      {
        path: 'messages',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire', 'mentor', 'entreprise'] },
        loadComponent: () => import('./features/messages/pages/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'notifications',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire', 'mentor', 'entreprise'] },
        loadComponent: () => import('./features/notifications/pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'fichiers',
        canActivate: [roleGuard],
        data: { roles: ['stagiaire', 'mentor', 'entreprise'] },
        loadComponent: () => import('./features/fichiers/pages/fichiers/fichiers.component').then(m => m.FichiersComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin/pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin/pages/users/users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'admin/partners',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin/pages/partners/partners.component').then(m => m.AdminPartnersComponent)
      },
      {
        path: 'admin/offres',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin/pages/offres/admin-offres.component').then(m => m.AdminOffresComponent)
      }
    ]
  },
  {
    path: 'cv/partage/:token',
    loadComponent: () => import('./features/cv/pages/cv-public/cv-public.component').then(m => m.CvPublicComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
