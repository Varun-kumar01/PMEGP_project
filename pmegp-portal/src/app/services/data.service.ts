import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = '/api/pmeg-data';

  constructor(private http: HttpClient) { }

  getPmegData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}