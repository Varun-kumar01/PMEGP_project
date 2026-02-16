import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StateLoginComponent } from './state-login/state-login.component';
import { CeoLoginComponent } from './ceo-login/ceo-login.component';
import { DcoLoginComponent } from './dco-login/dco-login.component';
import { DistrictLoginComponent } from './district-login/district-login.component';
import { KgmvLoginComponent } from './kgmv-login/kgmv-login.component';
import { EmployeeLoginComponent } from './employee-login/employee-login.component';
import { EmployeeRegistrationComponent } from './employee-registration/employee-registration.component';
import { PmegDashboardComponent } from './pmeg-dashboard/pmeg-dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { SecondTableComponent } from './second-table/second-table.component';
import { PhysicalVerificationFormComponent } from './physical-verification-form/physical-verification-form.component';
import { ReportComponent } from './report/report.component';

import { DistrictMandalFilterComponent } from './district-mandal-filter/district-mandal-filter.component'; 
import { CbcDataTableComponent } from './cbc-data-table/cbc-data-table.component';
import { CbcDataVerificationComponent } from './cbc-data-verification/cbc-data-verification.component';
import { CbcVerifiedReportComponent } from './cbc-verified-report/cbc-verified-report.component';
import { KvibTableComponent } from './kvib-table/kvib-table.component';
import { KvibDashboardComponent } from './kvib-dashboard/kvib-dashboard.component';


import { employeeAuthGuard } from './guards/employee-auth.guard';
import { districtAuthGuard } from './guards/district-auth.guard';

import { KvibYearDetailsComponent } from './kvib-year-details/kvib-year-details.component';

import { ProjectsComponent } from './projects/projects.component';





export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'state-login', component: StateLoginComponent },
  { path: 'ceo-login', component: CeoLoginComponent },
  { path: 'dco-login', component: DcoLoginComponent },
  { path: 'district-login', component: DistrictLoginComponent },
  { path: 'kgmv-login', component: KgmvLoginComponent },
  { path: 'employee-login', component: EmployeeLoginComponent },
  { path: 'employee-registration', component: EmployeeRegistrationComponent },
  { path: 'pmegp-dashboard', component: PmegDashboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'details/:name', component: SecondTableComponent },

  { 
    path: 'district-mandal-filter', 
    component: DistrictMandalFilterComponent,
    canActivate: [employeeAuthGuard] 
  },
  
  { 
    path: 'physical-verification', 
    component: PhysicalVerificationFormComponent,
    canActivate: [employeeAuthGuard] 
  },


  {
    path: 'report',
    component: ReportComponent,
    canActivate: [employeeAuthGuard] 
  },
  { 
  path: 'cbc-data-table', 
  component: CbcDataTableComponent,
},

{ 
  path: 'cbc-data-verification', 
  component: CbcDataVerificationComponent,
},

{ 
  path: 'cbc-verified-report', 
  component: CbcVerifiedReportComponent,
},
{ path: 'trainees', component: KvibTableComponent },
{ path: 'kvib-dashboard', component: KvibDashboardComponent },
{ path: 'kvib/year-details/:year', component: KvibYearDetailsComponent },

  { path: '**', redirectTo: 'dashboard' }
];