import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KvibDashboardService } from '../services/kvib-dashboard.service';

@Component({
  selector: 'app-kvib-year-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kvib-year-details.component.html',
  styleUrl: './kvib-year-details.component.css'
})
export class KvibYearDetailsComponent implements OnInit {

  year!: number;
  rows: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private dashboardService: KvibDashboardService
  ) {}

  ngOnInit(): void {
    this.year = Number(this.route.snapshot.paramMap.get('year'));
    this.loadDetails();
  }

  loadDetails() {
    this.dashboardService
      .getYearDetails(this.year)
      .subscribe(data => {
        this.rows = data;
      });
  }

  downloadCSV() {
    if (!this.rows || this.rows.length === 0) {
      return;
    }

    const headers = [
      'Trainee ID',
      'Name',
      'Batch ID',
      'course_name',
      'Gender',
      'Category',
      'Address'
    ];

    const csvRows = [];

 
    csvRows.push(headers.join(','));


    for (const row of this.rows) {
      csvRows.push([
        row.trainee_id,
        `"${row.name}"`,
        row.batch_id,
        `"${row.course_name}"`,
        row.gender,
        row.category,
        `"${row.address}"`
      ].join(','));

    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kvib_training_details_${this.year}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

}
