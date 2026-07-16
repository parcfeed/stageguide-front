import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
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
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/pages/portfolio/portfolio.component').then(m => m.PortfolioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'opportunites',
    loadComponent: () => import('./features/opportunites/pages/opportunites/opportunites.component').then(m => m.OpportunitesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'candidatures',
    loadComponent: () => import('./features/candidatures/pages/candidatures-list/candidatures-list.component').then(m => m.CandidaturesListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'entreprise',
    loadComponent: () => import('./features/entreprise/pages/entreprise/entreprise.component').then(m => m.EntrepriseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mentorat',
    loadComponent: () => import('./features/mentorat/pages/mentorat/mentorat.component').then(m => m.MentoratComponent),
    canActivate: [authGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/pages/messages/messages.component').then(m => m.MessagesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'fichiers',
    loadComponent: () => import('./features/fichiers/pages/fichiers/fichiers.component').then(m => m.FichiersComponent),
    canActivate: [authGuard]
  }
];
