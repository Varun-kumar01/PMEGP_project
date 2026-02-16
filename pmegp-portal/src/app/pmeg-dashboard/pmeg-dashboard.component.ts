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
        console.log('Successfully fetched PMEG data:', data);
      },
      error: (err: any) => {
        console.error('Error fetching PMEG data:', err);
      }
    });
  }

 
  onAgencyClick(event: Event, row: any) {
    event.preventDefault(); 
    

    this.router.navigate(['/details', row.name]); 
  }

}
