import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pmegp-report',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './pmegp-report.component.html',
  styleUrl: './pmegp-report.component.css'
})
export class PmegpReportComponent {
  selectedYear: string = '';
  isLoading = false;
  
  years = [
    '2025-2026',
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022',
    '2020-2021',
    '2019-2020',
    '2018-2019',
    '2017-2018',
    '2016-2017',
  ];

  constructor(private router: Router) {}

  getReport() {
    if (!this.selectedYear) {
      alert('Please select a year');
      return;
    }
    
    this.isLoading = true;
    console.log('Fetching report for year:', this.selectedYear);
    
    // Navigate to pmeg-dashboard with year as query parameter
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/pmegp-dashboard'], { queryParams: { year: this.selectedYear } });
    }, 500);
  }
}
