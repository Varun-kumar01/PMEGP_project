import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private location: Location, private router: Router) {}
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects() {
    this.http.get<any[]>(`${this.apiUrl}/projects`)
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.loading = false;
        },
        error: (err) => {
          console.error("Error fetching projects:", err);
          this.loading = false;
        }
      });
  }

  get totalPages(): number {
    return Math.ceil(this.projects.length / this.pageSize);
  }

  get paginatedProjects() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.projects.slice(start, start + this.pageSize);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewProject(file: string) {
    window.open(`${this.apiUrl.replace('/api','')}/uploads/projects/${file}`, '_blank');
  }
}
