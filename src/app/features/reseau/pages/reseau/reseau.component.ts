import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReseauService } from '../../../../core/services/reseau.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MessagesService } from '../../../../core/services/messages.service';
import {
  MembreReseau,
  SuggestionReseau,
  ConnexionActive,
  DemandeConnexionItem
} from '../../../../core/interfaces/reseau.interface';

@Component({
  selector: 'app-reseau',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reseau.component.html',
  styleUrls: ['./reseau.component.css']
})
export class ReseauComponent implements OnInit {
  private readonly reseauService = inject(ReseauService);
  private readonly authService = inject(AuthService);
  private readonly messagesService = inject(MessagesService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  // Tabs: 'suggestions' | 'membres' | 'connexions'
  activeTab = signal<'suggestions' | 'membres' | 'connexions'>('suggestions');

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Suggestions
  suggestions = signal<SuggestionReseau[]>([]);
  
  // Membres
  membres = signal<MembreReseau[]>([]);
  filtreRecherche = signal('');
  filtreRole = signal('');

  // Connexions
  connexionsActives = signal<ConnexionActive[]>([]);
  demandesRecues = signal<DemandeConnexionItem[]>([]);
  demandesEnvoyees = signal<DemandeConnexionItem[]>([]);

  // Modal message
  showConnectModal = signal(false);
  selectedDestinataire = signal<MembreReseau | null>(null);
  messageConnexion = signal('');
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.chargerDonnees();
  }

  setTab(tab: 'suggestions' | 'membres' | 'connexions'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  chargerDonnees(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Charger suggestions
    this.reseauService.getSuggestions().subscribe({
      next: (res) => this.suggestions.set(res.suggestions || []),
      error: () => {}
    });

    // Charger membres
    this.rechercherMembres();

    // Charger connexions
    this.chargerConnexions();
  }

  rechercherMembres(): void {
    this.reseauService.listerMembres(this.filtreRecherche(), this.filtreRole()).subscribe({
      next: (res) => {
        this.membres.set(res.membres || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors du chargement des membres');
        this.isLoading.set(false);
      }
    });
  }

  chargerConnexions(): void {
    this.reseauService.listerConnexions().subscribe({
      next: (res) => {
        this.connexionsActives.set(res.actives || []);
        this.demandesRecues.set(res.demandesRecues || []);
        this.demandesEnvoyees.set(res.demandesEnvoyees || []);
      },
      error: () => {}
    });
  }

  ouvrirModalConnexion(membre: MembreReseau): void {
    this.selectedDestinataire.set(membre);
    this.messageConnexion.set('Bonjour, je souhaiterais échanger avec vous sur StageGuide.');
    this.showConnectModal.set(true);
    this.errorMessage.set(null);
  }

  fermerModal(): void {
    this.showConnectModal.set(false);
    this.selectedDestinataire.set(null);
    this.messageConnexion.set('');
  }

  envoyerDemande(): void {
    const dest = this.selectedDestinataire();
    if (!dest) return;

    this.isSubmitting.set(true);
    this.reseauService.demanderConnexion({
      destinataireId: dest.id,
      message: this.messageConnexion()
    }).subscribe({
      next: () => {
        this.successMessage.set(`Demande de connexion envoyée à ${dest.prenom} ${dest.nom}`);
        this.isSubmitting.set(false);
        this.fermerModal();
        this.chargerConnexions();
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erreur lors de l’envoi de la demande';
        this.errorMessage.set(msg);
        this.isSubmitting.set(false);
      }
    });
  }

  repondreDemande(demandeId: string, decision: 'ACCEPTEE' | 'REFUSEE'): void {
    this.reseauService.repondreConnexion(demandeId, { decision }).subscribe({
      next: () => {
        this.successMessage.set(decision === 'ACCEPTEE' ? 'Connexion acceptée avec succès !' : 'Demande refusée');
        this.chargerConnexions();
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la réponse à la demande');
      }
    });
  }

  contacter(membreId: string): void {
    this.messagesService.creerConversation({
      participantIds: [membreId],
      titre: 'Échange réseau',
      premierMessage: 'Bonjour !'
    }).subscribe({
      next: () => this.router.navigate(['/messages']),
      error: () => this.router.navigate(['/messages'])
    });
  }
}
