import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GlanceService } from '../services/glance.service';

@Component({
  selector: 'app-glance',
  imports: [CommonModule, FormsModule],
  templateUrl: './glance.component.html',
  styleUrl: './glance.component.css'
})
export class GlanceComponent implements OnInit {
  years: string[] = [
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
  selectedYear: string = '';
  glanceTitle: string = '';
  glanceData: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private glanceService: GlanceService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get the title from route parameters
    this.activatedRoute.params.subscribe(params => {
      this.glanceTitle = decodeURIComponent(params['title'] || '');
      console.log('📊 Glance component loaded with title:', this.glanceTitle);
    });

    // Fetch available years from backend
    this.glanceService.getYears().subscribe(
      (response: any) => {
        const backendYears = response.years || [];
        console.log('📅 Backend years fetched:', backendYears);
        // Merge backend years with default years, removing duplicates
        this.years = Array.from(new Set([...backendYears, ...this.years])).sort().reverse();
        console.log('📅 Final years list:', this.years);
        if (this.years.length > 0) {
          this.selectedYear = this.years[0]; // Default to first year
          console.log('📅 Default year selected:', this.selectedYear);
          this.fetchGlanceData();
        }
      },
      (error) => {
        console.error('❌ Error fetching years:', error);
        // Use default years if backend fails
        if (this.years.length > 0) {
          this.selectedYear = this.years[0];
          this.fetchGlanceData();
        }
      }
    );
  }

  onYearChange() {
    console.log('📅 Year changed to:', this.selectedYear);
    if (this.selectedYear) {
      this.fetchGlanceData();
    }
  }

  fetchGlanceData() {
    if (!this.selectedYear || !this.glanceTitle) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Fetching glance data:', {
      year: this.selectedYear,
      title: this.glanceTitle
    });

    this.glanceService.getGlanceData(this.selectedYear, this.glanceTitle).subscribe(
      (response: any) => {
        console.log('Glance data received:', response);
        if (response.success) {
          this.glanceData = response.data || [];
          console.log(`Loaded ${this.glanceData.length} districts for ${this.glanceTitle}`);
        } else {
          this.errorMessage = response.message || 'No data available';
          this.glanceData = [];
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching glance data:', error);
        this.errorMessage = 'Failed to load glance data';
        this.glanceData = [];
        this.isLoading = false;
      }
    );
  }

  // Helper method to determine if current title shows projects and lakh columns
  shouldShowProjectsAndLakh(): boolean {
    const titlesWithProjectsAndLakh = [
      'Sanctioned by Bank',
      'Claim by Bank',
      'Disbursement by KVIC',
      'Pendency at Bank',
      'Referred by KVIC'
    ];
    return titlesWithProjectsAndLakh.includes(this.glanceTitle);
  }

}

