import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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

  viewProject(file: string) {
    window.open(`${this.apiUrl.replace('/api','')}/uploads/projects/${file}`, '_blank');
  }
}
