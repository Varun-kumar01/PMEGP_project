import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KvibDashboardService {

  private baseUrl = `${environment.apiUrl}/kvib-dashboard`;

  constructor(private http: HttpClient) {}

  getYears(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/years`);
  }

  getYearWiseStats(year: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/year-wise/${year}`);
  }
  getTotalStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/totals`);
  }

  getYearDetails(year: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/details/${year}`
    );
  }


}
