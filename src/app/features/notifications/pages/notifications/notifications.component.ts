import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationsService } from '../../../../core/services/notifications.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationItem } from '../../../../core/interfaces/notification.interface';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly notifications = signal<NotificationItem[]>([]);

  protected readonly sortedNotifications = computed(() =>
    this.notifications().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  protected readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.estLue).length
  );

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.loadNotifications();
      return;
    }
    this.authService.loadCurrentUser().subscribe({
      next: () => this.loadNotifications(),
      error: () => {
        this.errorMessage.set('Impossible de charger votre session.');
        this.isLoading.set(false);
      }
    });
  }

  protected marquerCommeLue(notif: NotificationItem): void {
    if (notif.estLue) return;
    this.notificationsService.marquerCommeLue(notif.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === notif.id ? { ...n, estLue: true } : n)
        );
      }
    });
  }

  protected marquerToutCommeLue(): void {
    this.notificationsService.marquerToutCommeLue().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, estLue: true }))
        );
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private loadNotifications(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.notificationsService.listerNotifications().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: response => {
        this.notifications.set(response.notifications ?? []);
      },
      error: error => {
        this.errorMessage.set(
          this.authService.getErrorMessage(error, 'Impossible de charger vos notifications.')
        );
      }
    });
  }
}
