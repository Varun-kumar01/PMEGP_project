import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableDataSource } from '@angular/material/table';
import { CbcDataService } from '../services/cbc-data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cbc-data-table',
  templateUrl: './cbc-data-table.component.html',
  styleUrls: ['./cbc-data-table.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatToolbarModule]
})
export class CbcDataTableComponent implements OnInit {
  tableRows: any[] = [];
  filteredRows: any[] = [];
  displayedRows: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  
  districts: any[] = [];
  selectedDistrict: string = '';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource<any>([]);
  pageSize = 10;
  pageIndex = 0;
  
  private apiUrl = environment.apiUrl;

  constructor(private cbcDataService: CbcDataService, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadDistricts();
    this.loadCbcData();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updateDisplayedRows();
      });
    }
  }

  loadDistricts(): void {
    this.http.get<any[]>(`${this.apiUrl}/district_mandals/districts`)
      .subscribe({
        next: (res) => this.districts = res,
        error: (err) => console.error('Error loading districts:', err)
      });
  }

  loadCbcData(): void {
    this.cbcDataService.getAllCbcData().subscribe({
      next: (data) => {
        this.tableRows = data;
        this.filteredRows = data;
        this.dataSource.data = data;
        this.pageIndex = 0;
        this.updateDisplayedRows();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching CBC data:', error);
        this.errorMessage = 'Failed to load CBC data';
        this.isLoading = false;
      }
    });
  }

  onDistrictFilter(): void {
    if (!this.selectedDistrict) {
      this.filteredRows = this.tableRows;
    } else {
      this.filteredRows = this.tableRows.filter(row => row.district === this.selectedDistrict);
    }
    this.pageIndex = 0;
    this.dataSource.data = this.filteredRows;
    this.updateDisplayedRows();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedRows();
  }

  updateDisplayedRows(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedRows = this.filteredRows.slice(startIndex, endIndex);
  }
}
