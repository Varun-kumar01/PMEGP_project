import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private apiUrl = `${environment.apiUrl}/verification`;

  constructor(private http: HttpClient) { }

  /**
   * Submits the verification form data, including files.
   * @param formData The FormData object containing files and data.
   */
  submitForm(formData: FormData): Observable<any> {
    // IMPORTANT: When sending FormData, DO NOT set the Content-Type header.
    // The browser will automatically set it to 'multipart/form-data'
    // and include the necessary boundaries.
    return this.http.post<any>(this.apiUrl, formData);
  }
}
