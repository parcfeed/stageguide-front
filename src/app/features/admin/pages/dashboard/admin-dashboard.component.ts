import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly location = inject(Location);

  protected readonly userCount = signal(0);
  protected readonly partnerCount = signal(0);
  protected readonly isLoading = signal(true);

  ngOnInit(): void {
    this.chargerStats();
  }

  protected goBack(): void {
    this.location.back();
  }

  private chargerStats(): void {
    this.adminService.listUsers({ limit: 1 }).subscribe(r => {
      if (r) this.userCount.set(r.total);
    });
    this.adminService.listPartners().subscribe(r => {
      if (r) this.partnerCount.set(r.length);
      this.isLoading.set(false);
    });
  }
}
