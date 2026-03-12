import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'; 
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-second-table',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DatePipe, DecimalPipe], 
  templateUrl: './second-table.component.html',
  styleUrl: './second-table.component.css',
})
export class SecondTableComponent implements OnInit {
  clickedRowName: string | null = null;
  selectedYear: string | null = null;
  secondTableData: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.clickedRowName = params['name'];
      if (this.clickedRowName) {
        this.route.queryParams.subscribe((queryParams) => {
          this.selectedYear = queryParams['year'] || null;
          this.fetchDistrictData(this.clickedRowName, this.selectedYear);
        });
      }
    });
  }

  fetchDistrictData(districtName: string | null, year?: string | null): void {
    if (!districtName) {
      this.errorMessage = 'District name is not available.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    // Build API URL with year parameter if available
    let apiUrl = `${environment.apiUrl}/pmeg-data/data/${districtName}`;
    if (year) {
      apiUrl += `?year=${year}`;
    }

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        console.log('Fetched data:', data);
        this.secondTableData = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.errorMessage = 'No data found for this district.';
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.errorMessage = `Error: ${err.error?.message || 'Could not load data.'}`;
        this.isLoading = false;
        this.secondTableData = [];
      },
    });
  }

  goBackToMainTable(): void {
    this.router.navigate(['/pmegp-dashboard']);
  }
}