import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../interfaces/user.interface';

let refreshRequest$: Observable<AuthResponse> | null = null;

const isAuthEndpoint = (url: string): boolean =>
  url.includes('/auth/login') ||
  url.includes('/auth/refresh') ||
  url.includes('/auth/register') ||
  url.includes('/auth/logout');

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for 401 Unauthorized errors, excluding actual authentication attempts
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        refreshRequest$ ??= authService.refreshTokens().pipe(
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false })
        );

        return refreshRequest$.pipe(
          switchMap(response => {
            // Clone the request with the new access token and retry
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`
              }
            });
            return next(newReq);
          }),
          catchError(refreshError => {
            // Refresh failed: clear credentials and redirect to login
            authService.logoutSilently();
            return throwError(() => authService.normalizeError(refreshError));
          })
        );
      }

      return throwError(() => authService.normalizeError(error));
    })
  );
};
