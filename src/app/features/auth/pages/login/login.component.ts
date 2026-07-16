import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals for state management
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Login form group
  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  /**
   * Submit credentials to login
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).pipe(
      catchError(err => {
        // Show proper error messages
        const msg = this.authService.getErrorMessage(
          err,
          'Une erreur est survenue lors de la connexion.'
        );
        this.errorMessage.set(msg);
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe(response => {
      if (response) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || this.authService.authenticatedRoute);
      }
    });
  }

  // Getters for form validation display
  protected get emailField() { return this.loginForm.controls.email; }
  protected get passwordField() { return this.loginForm.controls.password; }
}
