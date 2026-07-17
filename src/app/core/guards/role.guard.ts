import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (!user) return router.createUrlTree(['/login']);

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) return true;

  if (allowedRoles.includes(user.role)) return true;

  const fallbackRoutes: Record<string, string> = {
    stagiaire: '/dashboard',
    mentor: '/mentor/mentorat',
    entreprise: '/entreprise',
    admin: '/admin'
  };
  const fallback = fallbackRoutes[user.role] || '/dashboard';
  return router.createUrlTree([fallback]);
};
