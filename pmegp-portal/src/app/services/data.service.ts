import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // CRITICAL: You must include 'http://' so Angular knows to leave localhost:4200
  private apiUrl = 'http://localhost:3000/api/pmeg-data';

  constructor(private http: HttpClient) { }

  getPmegData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPmegDataByYear(year: string): Observable<any[]> {
    // Correct URL will be: http://localhost:3000/api/pmeg-data/year/2025-2026
    return this.http.get<any[]>(`${this.apiUrl}/year/${year}`);
  }

  getDateRange(): Observable<any> {
    // Correct URL will be: http://localhost:3000/api/pmeg-data/date-range
    return this.http.get<any>(`${this.apiUrl}/date-range`);
  }
}