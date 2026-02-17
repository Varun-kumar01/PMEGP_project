import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';


import { DataService } from '../services/data.service';

@Component({
  selector: 'app-pmeg-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pmeg-dashboard.component.html',
  styleUrls: ['./pmeg-dashboard.component.css']
})
export class PmegDashboardComponent implements OnInit {

  
  tableData: any[] = [];
  totals: any = {};



  constructor(
    private dataService: DataService,
    private router: Router 
  ) { }

  ngOnInit(): void {

    this.loadPmegData();
 
  }

  loadPmegData(): void {
    this.dataService.getPmegData().subscribe({
      next: (data: any) => {
        this.tableData = data;
        this.calculateTotals();   // ⭐ ADD THIS LINE
        console.log('Successfully fetched PMEG data:', data);
      },
      error: (err: any) => {
        console.error('Error fetching PMEG data:', err);
      }
    });
  }

  calculateTotals(): void {

  const fields = [
    'agencyReceived',
    'agencyReturned',
    'Pending_At_Agency',
    'Forwarded_to_Bank',
    'sanctionedPrj',
    'sanctionedLakh',
    'claimedPrj',
    'claimedLakh',
    'disbursementPrj',
    'disbursementLakh',
    'bankReturned',
    'pendingBankPrj',
    'pendingBankLakh',
    'pendingDisbursementPrj',
    'pendingDisbursementLakh'
  ];

  // reset totals
  this.totals = {};

  fields.forEach(field => {
    this.totals[field] = 0;
  });

  // calculate
  this.tableData.forEach(row => {
    fields.forEach(field => {
      const value = Number(row[field]) || 0;
      this.totals[field] += value;
    });
  });

}

 
  onAgencyClick(event: Event, row: any) {
    event.preventDefault(); 
    

    this.router.navigate(['/details', row.name]); 
  }

}
