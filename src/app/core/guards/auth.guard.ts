import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

/**
 * Route guard that requires the user to be authenticated.
 * If not authenticated, redirects to /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // If we have an access token in localStorage but state is not loaded (e.g. after refresh),
  // try to fetch user info from backend.
  if (tokenService.getAccessToken()) {
    return authService.loadCurrentUser().pipe(
      map(() => true),
      catchError(() => {
        return of(router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        }));
      })
    );
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Route guard that requires the user to be unauthenticated (guest).
 * If authenticated, redirects to the dashboard.
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree([authService.authenticatedRoute]);
  }

  if (!tokenService.getAccessToken()) {
    return true;
  }

  return authService.loadCurrentUser().pipe(
    map(() => router.createUrlTree([authService.authenticatedRoute])),
    catchError(() => of(true))
  );
};
