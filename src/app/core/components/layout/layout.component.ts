import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar></app-sidebar>
    <main class="layout-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './layout.component.css'
})
export class LayoutComponent {}
