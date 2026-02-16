import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  private districtTokenKey = 'district_token';
  private employeeTokenKey = 'employee_token';
  private stateTokenKey = 'state_token';

  constructor(private http: HttpClient, private router: Router) { }


  districtRegister(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/district/register`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token, 'district');
        }
      })
    );
  }

  districtLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/district/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token, 'district');
        }
      })
    );
  }

  stateLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/state/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token, 'state');
        }
      })
    );
  }
  stateRegister(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/state/register`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token, 'state');
        }
      })
    );
  }

  ceoLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ceo/login`, credentials);
  }

  ceoRegister(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ceo/register`, credentials);
  }

  dcoLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dco/login`, credentials);
  }

  dcoRegister(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dco/register`, credentials);
  }

  kgmvLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/kgmv/login`, credentials);
  }

  kgmvRegister(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/kgmv/register`, credentials);
  }


  employeeLogin(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employee/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) { 
          this.storeToken(response.token, 'employee');
        }
      })
    );
  }

  employeeRegister(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/employee/register`, credentials);
  }

  private storeToken(token: string, role: 'employee' | 'district' | 'state') {
    const key = this.getTokenKey(role);
    localStorage.setItem(key, token);
  }

  public getToken(role: 'employee' | 'district' | 'state'): string | null {
    const key = this.getTokenKey(role);
    return localStorage.getItem(key);
  }


  getAuthToken(): string | null {
    return this.getToken('employee') || this.getToken('district') || this.getToken('state');
  }


  isAuthenticated(role: 'employee' | 'district' | 'state'): boolean {
    const token = this.getToken(role);
    return !!token;
  }

  logout() {
    localStorage.removeItem(this.employeeTokenKey);
    localStorage.removeItem(this.districtTokenKey);
    localStorage.removeItem('state_token');
    this.router.navigate(['/']);
  }

  private getTokenKey(role: 'employee' | 'district' | 'state'): string {
    if (role === 'district') return this.districtTokenKey;
    if (role === 'employee') return this.employeeTokenKey;
    return 'state_token';
  }
}

