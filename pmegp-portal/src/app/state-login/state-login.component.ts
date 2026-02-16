import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-state-login',
  standalone: true, 
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './state-login.component.html',
  styleUrl: './state-login.component.css'
})
export class StateLoginComponent {

  mode: 'login' | 'register' = 'login';

  loginData = {
    username: '',
    password: '',
  };

  registerData = {
    username: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.mode === 'login') {
      this.onLoginSubmit();
    } else {
      this.onRegisterSubmit();
    }
  }

  onLoginSubmit() {
    this.errorMessage = '';
    
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.authService.stateLogin(this.loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/report']); 
        } else {
          this.errorMessage = response.message || 'Login failed.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'An error occurred during login.';
      }
    });
  }

  onRegisterSubmit() {
    this.errorMessage = '';
    
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    
    if (!this.registerData.username || !this.registerData.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    const credentials = {
      username: this.registerData.username,
      password: this.registerData.password
    };

    this.authService.stateRegister(credentials).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/report']);
        } else {
          this.errorMessage = response.message || 'Registration failed.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'An error occurred during registration.';
      }
    });
  }

  resetForm() {
    this.loginData = { username: '', password: '' };
    this.registerData = { username: '', password: '', confirmPassword: '' };
    this.errorMessage = '';
  }

  onForgotPassword() {
    alert('Forgot password functionality will be implemented.');
  }

}