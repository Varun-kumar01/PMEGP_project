import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CbcDataService {
  private apiUrl = `${environment.apiUrl}/cbc-data`;

  constructor(private http: HttpClient) { }

  getAllCbcData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCbcDataById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
