import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlanceService {

  private baseUrl = `${environment.apiUrl}/glance`;

  constructor(private http: HttpClient) {}

  getYears(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/years`);
  }

  getGlanceData(year: string, title: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/data`, {
      params: {
        year: year,
        title: title
      }
    });
  }

}
