import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjetPortfolio, CreerProjetPayload, ModifierProjetPayload, PortfolioListResponse } from '../../../../core/interfaces/portfolio.interface';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  isLoading = signal(false);
  isCreating = signal(false);
  isEditing = signal(false);
  isDeleting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Portfolio data
  portfolioData = signal<PortfolioListResponse | null>(null);
  projects = computed(() => this.portfolioData()?.projets || []);

  // Selected project for editing
  selectedProject = signal<ProjetPortfolio | null>(null);
  projectToDelete = signal<ProjetPortfolio | null>(null);

  // Form groups
  createForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(1)]],
    description: ['', []],
    tags: ['', []],
    imageUrl: ['', []],
    lienProjet: ['', []]
  });

  editForm: FormGroup = this.fb.group({
    titre: ['', []],
    description: ['', []],
    tags: ['', []],
    imageUrl: ['', []],
    lienProjet: ['', []]
  });

  // UI helpers
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);

  ngOnInit(): void {
    this.loadPortfolio();
  }

  /**
   * Load portfolio projects
   */
  private loadPortfolio(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.portfolioService.listerProjets().subscribe({
      next: (data) => {
        this.portfolioData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors du chargement du portfolio');
        console.error('Error loading portfolio:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Parse tags string to array
   */
  private parseTags(tagsString: string): string[] {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * Convert tags array to string
   */
  private tagsToString(tags?: string[]): string {
    return (tags || []).join(', ');
  }

   /**
    * Show create modal
    */
   showCreate(): void {
     this.showCreateModal.set(true);
     this.createForm.reset();
     this.errorMessage.set(null);
     this.successMessage.set(null);
   }

   /**
    * Cancel create modal
    */
   cancelCreate(): void {
     this.showCreateModal.set(false);
     this.createForm.reset();
     this.errorMessage.set(null);
   }

   /**
    * Create new project
    */
   createProject(): void {
     if (this.createForm.invalid) {
       this.errorMessage.set('Le titre est obligatoire');
       return;
     }

     this.isCreating.set(true);
     this.errorMessage.set(null);
     this.successMessage.set(null);

     const formValue = this.createForm.value;
     const payload: CreerProjetPayload = {
       titre: formValue.titre,
       description: formValue.description || undefined,
       tags: this.parseTags(formValue.tags),
       imageUrl: formValue.imageUrl || undefined,
       lienProjet: formValue.lienProjet || undefined
     };

     this.portfolioService.creerProjet(payload).subscribe({
       next: (project) => {
         this.successMessage.set('Projet créé avec succès');
         this.showCreateModal.set(false);
         this.createForm.reset();
         this.loadPortfolio();
         this.isCreating.set(false);
       },
       error: (err) => {
         this.errorMessage.set('Erreur lors de la création du projet');
         console.error('Error creating project:', err);
         this.isCreating.set(false);
       }
     });
   }

   /**
    * Show edit modal for a project
    */
   showEdit(project: ProjetPortfolio): void {
     this.selectedProject.set(project);
     this.showEditModal.set(true);
     this.editForm.patchValue({
       titre: project.titre,
       description: project.description || '',
       tags: this.tagsToString(project.tags),
       imageUrl: project.imageUrl || '',
       lienProjet: project.lienProjet || ''
     });
     this.errorMessage.set(null);
     this.successMessage.set(null);
   }

   /**
    * Cancel edit modal
    */
   cancelEdit(): void {
     this.showEditModal.set(false);
     this.selectedProject.set(null);
     this.editForm.reset();
     this.errorMessage.set(null);
   }

   /**
    * Update project
    */
   updateProject(): void {
     if (!this.selectedProject() || this.editForm.invalid) {
       return;
     }

     this.isEditing.set(true);
     this.errorMessage.set(null);
     this.successMessage.set(null);

     const formValue = this.editForm.value;
     const payload: ModifierProjetPayload = {};

     // Only include changed fields
     if (formValue.titre) payload.titre = formValue.titre;
     if (formValue.description) payload.description = formValue.description;
     if (formValue.tags) payload.tags = this.parseTags(formValue.tags);
     if (formValue.imageUrl) payload.imageUrl = formValue.imageUrl;
     if (formValue.lienProjet) payload.lienProjet = formValue.lienProjet;

     this.portfolioService.modifierProjet(this.selectedProject()!.id, payload).subscribe({
       next: () => {
         this.successMessage.set('Projet mis à jour avec succès');
         this.showEditModal.set(false);
         this.selectedProject.set(null);
         this.editForm.reset();
         this.loadPortfolio();
         this.isEditing.set(false);
       },
       error: (err) => {
         this.errorMessage.set('Erreur lors de la mise à jour du projet');
         console.error('Error updating project:', err);
         this.isEditing.set(false);
       }
     });
   }

  /**
   * Show delete confirmation modal
   */
  confirmDelete(project: ProjetPortfolio): void {
    this.projectToDelete.set(project);
    this.showDeleteModal.set(true);
    this.errorMessage.set(null);
  }

  /**
   * Cancel delete
   */
  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.projectToDelete.set(null);
  }

  /**
   * Delete project
   */
  deleteProject(): void {
    if (!this.projectToDelete()) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.portfolioService.supprimerProjet(this.projectToDelete()!.id).subscribe({
      next: () => {
        this.successMessage.set('Projet supprimé avec succès');
        this.showDeleteModal.set(false);
        this.projectToDelete.set(null);
        this.loadPortfolio();
        this.isDeleting.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de la suppression du projet');
        console.error('Error deleting project:', err);
        this.isDeleting.set(false);
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
