import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  protected readonly title = signal('stageguide-front');
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected closeToast(id: number): void {
    this.toastService.remove(id);
  }
}
