import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './employee-login.component.html',
  styleUrl: './employee-login.component.css'
})
export class EmployeeLoginComponent {
  
  loginData = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }


  onSubmit() {
    this.errorMessage = ''; 

    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Please fill in both username and password.';
      return; 
    }

    this.isLoading = true;

    this.authService.employeeLogin(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/district-mandal-filter']);
        } else {
          this.errorMessage = response.message || 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error; 
      }
    });
  }

  resetForm() {
    this.loginData = {
      username: '',
      password: '',
    };
    this.errorMessage = '';
  }

  onForgotPassword() {
    alert('Forgot password functionality will be implemented.');
  }

  onNewRegistration() {
    this.router.navigate(['/employee-registration']);
  }
}
