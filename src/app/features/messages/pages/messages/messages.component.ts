import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NavbarComponent } from '../../../../core/components/navbar/navbar.component';
import { MessagesService } from '../../../../core/services/messages.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  ConversationListItem,
  MessageItem
} from '../../../../core/interfaces/message.interface';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  private readonly messagesService = inject(MessagesService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly isSending = signal(false);
  protected readonly isLoadingMessages = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly conversations = signal<ConversationListItem[]>([]);
  protected readonly selectedConversation = signal<ConversationListItem | null>(null);
  protected readonly messages = signal<MessageItem[]>([]);

  protected readonly messageForm = this.fb.nonNullable.group({
    contenu: ['', [Validators.required, Validators.minLength(1)]]
  });

  protected readonly currentUserId = signal<string | null>(null);

  protected readonly sortedConversations = computed(() =>
    this.conversations().sort(
      (a, b) => new Date(b.misAJourLe).getTime() - new Date(a.misAJourLe).getTime()
    )
  );

  protected readonly unreadTotal = computed(() =>
    this.conversations().reduce((sum, c) => sum + (c.nonLu || 0), 0)
  );

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId.set(user.id);
      this.loadConversations();
      return;
    }
    this.authService.loadCurrentUser().subscribe({
      next: loadedUser => {
        this.currentUserId.set(loadedUser.id);
        this.loadConversations();
      },
      error: () => {
        this.errorMessage.set('Impossible de charger votre session.');
        this.isLoading.set(false);
      }
    });
  }

  protected selectConversation(conv: ConversationListItem): void {
    this.selectedConversation.set(conv);
    this.isLoadingMessages.set(true);
    this.errorMessage.set(null);

    this.messagesService.getConversation(conv.id).pipe(
      finalize(() => this.isLoadingMessages.set(false))
    ).subscribe({
      next: response => {
        this.messages.set(response.messages ?? []);
      },
      error: error => {
        this.errorMessage.set(
          this.authService.getErrorMessage(error, 'Impossible de charger les messages.')
        );
      }
    });
  }

  protected sendMessage(): void {
    const conv = this.selectedConversation();
    if (!conv || this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.errorMessage.set(null);

    const { contenu } = this.messageForm.getRawValue();

    this.messagesService.envoyerMessage(conv.id, { contenu }).pipe(
      finalize(() => this.isSending.set(false))
    ).subscribe({
      next: newMessage => {
        this.messages.update(current => [...current, newMessage]);
        this.messageForm.reset();
        this.successMessage.set('Message envoye avec succes.');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: error => {
        this.errorMessage.set(
          this.authService.getErrorMessage(error, 'Impossible d envoyer le message.')
        );
      }
    });
  }

  protected isOwnMessage(message: MessageItem): boolean {
    return message.expediteurId === this.currentUserId();
  }

  protected conversationTitle(conv: ConversationListItem): string {
    if (conv.titre) return conv.titre;
    const others = conv.participants.filter(p => p.id !== this.currentUserId());
    return others.map(p => `${p.prenom} ${p.nom}`).join(', ') || 'Conversation';
  }

  protected participantNames(conv: ConversationListItem): string {
    return conv.participants.map(p => `${p.prenom} ${p.nom}`).join(', ');
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  protected goBackToList(): void {
    this.selectedConversation.set(null);
    this.messages.set([]);
  }

  private loadConversations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.messagesService.listerConversations().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: response => {
        this.conversations.set(response.conversations ?? []);
      },
      error: error => {
        this.errorMessage.set(
          this.authService.getErrorMessage(error, 'Impossible de charger vos conversations.')
        );
      }
    });
  }
}
