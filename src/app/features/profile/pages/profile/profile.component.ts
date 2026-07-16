import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { StagiaireProfile, MentorProfile, UpdateStagiaireProfilePayload, UpdateMentorProfilePayload } from '../../../../core/interfaces/profile.interface';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Profile data signals
  stagiaireProfile = signal<StagiaireProfile | null>(null);
  mentorProfile = signal<MentorProfile | null>(null);

  // Current user (from AuthService)
  currentUser = this.authService.currentUser;

  // Computed properties
  isStagiaire = computed(() => this.currentUser()?.role === 'stagiaire');
  isMentor = computed(() => this.currentUser()?.role === 'mentor');

  // Form groups
  stagiaireForm: FormGroup = this.fb.group({
    telephone: ['', []],
    ecole: ['', [Validators.required, Validators.minLength(1)]],
    niveauEtudes: ['', [Validators.required, Validators.minLength(1)]],
    bio: ['', []]
  });

  mentorForm: FormGroup = this.fb.group({
    telephone: ['', []],
    entreprise: ['', [Validators.required, Validators.minLength(1)]],
    poste: ['', [Validators.required, Validators.minLength(1)]],
    bio: ['', []]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Load profile based on user role
   */
  private loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.isStagiaire()) {
      this.profileService.getStagiaireProfile().subscribe({
        next: (profile) => {
          this.stagiaireProfile.set(profile);
          this.populateStagiaireForm(profile);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors du chargement du profil');
          console.error('Error loading stagiaire profile:', err);
          this.isLoading.set(false);
        }
      });
    } else if (this.isMentor()) {
      this.profileService.getMentorProfile().subscribe({
        next: (profile) => {
          this.mentorProfile.set(profile);
          this.populateMentorForm(profile);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Erreur lors du chargement du profil');
          console.error('Error loading mentor profile:', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.errorMessage.set('Rôle utilisateur non supporté');
      this.isLoading.set(false);
    }
  }

  /**
   * Populate stagiaire form with profile data
   */
  private populateStagiaireForm(profile: StagiaireProfile): void {
    this.stagiaireForm.patchValue({
      telephone: profile.telephone || '',
      ecole: profile.ecole || '',
      niveauEtudes: profile.niveauEtudes || '',
      bio: profile.bio || ''
    });
  }

  /**
   * Populate mentor form with profile data
   */
  private populateMentorForm(profile: MentorProfile): void {
    this.mentorForm.patchValue({
      telephone: profile.telephone || '',
      entreprise: profile.entreprise || '',
      poste: profile.poste || '',
      bio: profile.bio || ''
    });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditMode.set(!this.isEditMode());
    this.successMessage.set(null);
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.isEditMode.set(false);
    if (this.isStagiaire() && this.stagiaireProfile()) {
      this.populateStagiaireForm(this.stagiaireProfile()!);
    } else if (this.isMentor() && this.mentorProfile()) {
      this.populateMentorForm(this.mentorProfile()!);
    }
    this.errorMessage.set(null);
  }

  /**
   * Save stagiaire profile
   */
  saveStagiaireProfile(): void {
    if (this.stagiaireForm.invalid) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UpdateStagiaireProfilePayload = this.stagiaireForm.value;

    this.profileService.updateStagiaireProfile(payload).subscribe({
      next: (response) => {
        // Extract profile data (response includes message field)
        const profileData: StagiaireProfile = {
          utilisateurId: response.utilisateurId,
          prenom: response.prenom,
          nom: response.nom,
          telephone: response.telephone,
          ecole: response.ecole,
          niveauEtudes: response.niveauEtudes,
          bio: response.bio
        };
        this.stagiaireProfile.set(profileData);
        this.isEditMode.set(false);
        this.successMessage.set(response.message || 'Profil mis à jour avec succès');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de la mise à jour du profil');
        console.error('Error updating stagiaire profile:', err);
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Save mentor profile
   */
  saveMentorProfile(): void {
    if (this.mentorForm.invalid) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UpdateMentorProfilePayload = this.mentorForm.value;

    this.profileService.updateMentorProfile(payload).subscribe({
      next: (response) => {
        // Extract profile data (response includes message field)
        const profileData: MentorProfile = {
          utilisateurId: response.utilisateurId,
          prenom: response.prenom,
          nom: response.nom,
          telephone: response.telephone,
          entreprise: response.entreprise,
          poste: response.poste,
          bio: response.bio
        };
        this.mentorProfile.set(profileData);
        this.isEditMode.set(false);
        this.successMessage.set(response.message || 'Profil mis à jour avec succès');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de la mise à jour du profil');
        console.error('Error updating mentor profile:', err);
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Go back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
