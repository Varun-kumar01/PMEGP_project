import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KvibDashboardService } from '../services/kvib-dashboard.service';

@Component({
  selector: 'app-kvib-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './kvib-dashboard.component.html',
  styleUrl: './kvib-dashboard.component.css'
})
export class KvibDashboardComponent implements OnInit {


  years: number[] = [];
  selectedYear: number | null = null;


  yearData: any = null;
  totalStats: {
    total_batches: number;
    total_trainees: number;
  } | null = null;

  constructor(
    private router: Router,
    private dashboardService: KvibDashboardService
  ) {}

  ngOnInit(): void {
    this.loadYears();
    this.loadTotalStats();
  }

  loadYears() {
    this.dashboardService.getYears().subscribe({
      next: (data) => {
        this.years = data;
      }
    });
  }

  loadTotalStats() {
    this.dashboardService.getTotalStats().subscribe({
      next: (data) => {
        this.totalStats = data;
      }
    });
  }

  onYearChange() {
    if (!this.selectedYear) {
      this.yearData = null;
      return;
    }

    this.dashboardService
      .getYearWiseStats(this.selectedYear)
      .subscribe({
        next: (data) => {
          this.yearData = data;
        }
      });
  }


  viewYearDetails(year: number) {
    this.router.navigate(['/kvib/year-details', year]);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/dashboard']);
  }
}

