import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  User
} from '../interfaces/user.interface';
import { API_BASE_URL } from '../constants/api.constants';
import { TokenService } from './token.service';

export interface ClientError extends Error {
  status: number;
  userMessage: string;
  originalError: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private readonly apiUrl = API_BASE_URL;
  readonly authenticatedRoute = '/dashboard';

  // Backing writeable signal for current user
  private readonly _currentUser = signal<User | null>(null);

  // Read-only signal exposed to components
  readonly currentUser = this._currentUser.asReadonly();

  // Computed property to check if user is authenticated
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /**
   * Log in user with credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
        this._currentUser.set(response.user);
      })
    );
  }

  /**
   * Register a new user
   */
  register(userData: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
        this._currentUser.set(response.user);
      })
    );
  }

  /**
   * Rotate access & refresh tokens
   */
  refreshTokens(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
        this._currentUser.set(response.user);
      })
    );
  }

  /**
   * Log out user and revoke session in backend
   */
  logout(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();

    // Clear client tokens first to avoid blocking the user
    this.logoutSilently();

    if (!refreshToken) {
      return of({ message: 'Deconnexion reussie' });
    }

    return this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken }).pipe(
      catchError(() => of({ message: 'Deconnexion reussie' }))
    );
  }

  /**
   * Fetch current user profile
   */
  loadCurrentUser(): Observable<User> {
    const accessToken = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();

    if (!accessToken) {
      this._currentUser.set(null);

      if (refreshToken) {
        return this.refreshTokens().pipe(
          switchMap(() => this.fetchCurrentUser())
        );
      }

      return throwError(() => new Error('No access token available'));
    }

    return this.fetchCurrentUser();
  }

  /**
   * Return a user-facing message for API and network errors.
   */
  getErrorMessage(error: unknown, fallback: string): string {
    if (this.isClientError(error)) {
      return error.userMessage;
    }

    if (error instanceof HttpErrorResponse) {
      return this.extractErrorMessage(error, fallback);
    }

    return fallback;
  }

  /**
   * Normalize HttpErrorResponse instances for interceptors and components.
   */
  normalizeError(error: unknown): ClientError {
    if (this.isClientError(error)) {
      return error;
    }

    const status = error instanceof HttpErrorResponse ? error.status : 0;
    const userMessage = error instanceof HttpErrorResponse
      ? this.extractErrorMessage(error, 'Une erreur est survenue.')
      : 'Une erreur est survenue.';
    const clientError = new Error(userMessage) as ClientError;

    clientError.status = status;
    clientError.userMessage = userMessage;
    clientError.originalError = error;

    return clientError;
  }

  redirectToAuthenticatedArea(): Promise<boolean> {
    return this.router.navigateByUrl(this.authenticatedRoute);
  }

  private fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => this._currentUser.set(user)),
      catchError(error => {
        this._currentUser.set(null);
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear tokens and reset state locally without making API calls
   */
  logoutSilently(): void {
    this.tokenService.clearTokens();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private isClientError(error: unknown): error is ClientError {
    return error instanceof Error &&
      'userMessage' in error &&
      'status' in error &&
      'originalError' in error;
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    switch (error.status) {
      case 0:
        return 'Impossible de contacter le serveur.';
      case 401:
        return 'Session expiree. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n avez pas les droits pour effectuer cette action.';
      case 404:
        return 'Ressource introuvable.';
      case 409:
        return 'Cette ressource existe deja.';
      case 500:
        return 'Erreur serveur. Veuillez reessayer plus tard.';
      default:
        return fallback;
    }
  }
}
