import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterPayload, UserRole } from '../../../../core/interfaces/user.interface';

// Password match validator at FormGroup level
const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    const errors = confirmPassword.errors || {};
    confirmPassword.setErrors({ ...errors, passwordMismatch: true });
    return { passwordMismatch: true };
  } else if (confirmPassword) {
    const errors = confirmPassword.errors;
    if (errors) {
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // States
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedRole = signal<UserRole>(UserRole.STAGIAIRE);

  // Roles enum for template access
  protected readonly UserRole = UserRole;

  // Form definition
  protected readonly registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8), 
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // Must contain uppercase + number
    ]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    prenom: ['', [Validators.required, Validators.minLength(1)]],
    nom: ['', [Validators.required, Validators.minLength(1)]],
    telephone: [''],
    role: [UserRole.STAGIAIRE, [Validators.required]],
    consentGiven: [false, [Validators.requiredTrue]],
    
    // Stagiaire fields
    ecole: [''],
    niveauEtudes: [''],
    
    // Entreprise / Mentor fields
    entreprise: [''],
    poste: [''],
    bio: ['']
  }, { validators: passwordMatchValidator });

  constructor() {
    // Listen to changes on selectedRole to adjust form validations dynamically
    effect(() => {
      const role = this.selectedRole();
      this.registerForm.controls.role.setValue(role);
      this.updateConditionalValidators(role);
    });
  }

  /**
   * Set role to Stagiaire, Mentor or Entreprise
   */
  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  /**
   * Handle conditional validations based on role
   */
  private updateConditionalValidators(role: UserRole): void {
    const controls = this.registerForm.controls;

    // Reset validations first
    controls.niveauEtudes.clearValidators();
    controls.entreprise.clearValidators();

    if (role === UserRole.STAGIAIRE) {
      controls.niveauEtudes.setValidators([Validators.required, Validators.minLength(1)]);
    } else if (role === UserRole.ENTREPRISE) {
      controls.entreprise.setValidators([Validators.required, Validators.minLength(1)]);
    }

    // Refresh validity checks
    controls.niveauEtudes.updateValueAndValidity();
    controls.entreprise.updateValueAndValidity();
  }

  /**
   * Submit registration
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Prepare payload
    const formValues = this.registerForm.getRawValue();
    const payload: RegisterPayload = {
      email: formValues.email,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      prenom: formValues.prenom,
      nom: formValues.nom,
      role: formValues.role,
      consentGiven: formValues.consentGiven
    };

    if (formValues.telephone) {
      payload.telephone = formValues.telephone;
    }

    // Assign conditional fields based on role
    if (formValues.role === UserRole.STAGIAIRE) {
      payload.ecole = formValues.ecole || undefined;
      payload.niveauEtudes = formValues.niveauEtudes;
    } else if (formValues.role === UserRole.ENTREPRISE) {
      payload.entreprise = formValues.entreprise;
    } else if (formValues.role === UserRole.MENTOR) {
      payload.entreprise = formValues.entreprise || undefined;
      payload.poste = formValues.poste || undefined;
      payload.bio = formValues.bio || undefined;
    }

    this.authService.register(payload).pipe(
      catchError(err => {
        const msg = this.authService.getErrorMessage(
          err,
          "Une erreur est survenue lors de l'inscription."
        );
        this.errorMessage.set(msg);
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe(response => {
      if (response) {
        this.router.navigateByUrl(this.authService.authenticatedRoute);
      }
    });
  }

  // Getters for form validations
  protected get emailField() { return this.registerForm.controls.email; }
  protected get passwordField() { return this.registerForm.controls.password; }
  protected get confirmPasswordField() { return this.registerForm.controls.confirmPassword; }
  protected get prenomField() { return this.registerForm.controls.prenom; }
  protected get nomField() { return this.registerForm.controls.nom; }
  protected get consentField() { return this.registerForm.controls.consentGiven; }
  protected get ecoleField() { return this.registerForm.controls.ecole; }
  protected get niveauField() { return this.registerForm.controls.niveauEtudes; }
  protected get entrepriseField() { return this.registerForm.controls.entreprise; }
  protected get posteField() { return this.registerForm.controls.poste; }
  protected get bioField() { return this.registerForm.controls.bio; }
}
