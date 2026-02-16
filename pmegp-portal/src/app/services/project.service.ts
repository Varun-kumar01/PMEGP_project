import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  baseUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) {}

  uploadProject(data: FormData) {
    return this.http.post(`${this.baseUrl}/upload`, data);
  }

  getProjects() {
    return this.http.get<any[]>(this.baseUrl);
  }
}
