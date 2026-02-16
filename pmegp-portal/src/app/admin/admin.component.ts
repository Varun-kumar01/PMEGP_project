// import { Component, ViewChild, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { environment } from '../../environments/environment';

// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatFormFieldModule } from '@angular/material/form-field';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   templateUrl: './admin.component.html',
//   styleUrl: './admin.component.css',
//   imports: [
//     CommonModule,
//     FormsModule,
//     HttpClientModule,
//     MatCardModule,
//     MatButtonModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatFormFieldModule,
//   ]
// })
// export class AdminComponent {

//   private apiUrl = environment.apiUrl;
//   @ViewChild('fileInput') fileInput!: ElementRef;
//   mainFile: File | null = null;
//   uploadMessage: string | null = null;
//   isUploading = false;
//   messageType: 'success' | 'error' | 'info' = 'info';

//   @ViewChild('agencyFileInput') agencyFileInput!: ElementRef;
//   agencyFile: File | null = null;
//   agencyUploadMessage: string | null = null;
//   isUploadingAgency = false;
//   agencyMessageType: 'success' | 'error' | 'info' = 'info';


//   @ViewChild('kvibFileInput') kvibFileInput!: ElementRef;
//   kvibFile: File | null = null;
//   kvibUploadMessage: string | null = null;
//   isUploadingKvib = false;
//   kvibMessageType: 'success' | 'error' | 'info' = 'info';

//   constructor(private http: HttpClient) {}


//   onMainFileSelected(event: any) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.mainFile = input.files[0];
//       this.uploadMessage = null;
//     }
//   }

//   uploadFiles() {
//     if (!this.mainFile) return;
//     this.isUploading = true;
//     this.uploadMessage = "Uploading main file...";
//     this.messageType = 'info';
//     const formData = new FormData();
//     formData.append("mainExcel", this.mainFile);
//     this.http.post<any>(`${this.apiUrl}/pmeg-data/upload`, formData).subscribe({
//       next: (res) => {
//         this.uploadMessage = res.message;
//         this.messageType = 'success';
//         this.isUploading = false;
//         this.mainFile = null;
//         this.fileInput.nativeElement.value = '';
//       },
//       error: (err) => {
//         this.uploadMessage = "Upload failed: " + (err.error?.message || err.message);
//         this.messageType = 'error';
//         this.isUploading = false;
//       }
//     });
//   }

//   onAgencyFileSelected(event: any) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.agencyFile = input.files[0];
//       this.agencyUploadMessage = null;
//     }
//   }

//   uploadAgencyFile() {
//     if (!this.agencyFile) return;
//     this.isUploadingAgency = true;
//     this.agencyUploadMessage = "Uploading agency file...";
//     this.agencyMessageType = 'info';
//     const formData = new FormData();
//     formData.append("file", this.agencyFile);
//     this.http.post<any>(`${this.apiUrl}/pmeg-data/upload-detail`, formData).subscribe({
//       next: (res) => {
//         this.agencyUploadMessage = res.message;
//         this.agencyMessageType = 'success';
//         this.isUploadingAgency = false;
//         this.agencyFile = null;
//         this.agencyFileInput.nativeElement.value = '';
//       },
//       error: (err) => {
//         this.agencyUploadMessage = "Upload failed: " + (err.error?.message || err.message);
//         this.agencyMessageType = 'error';
//         this.isUploadingAgency = false;
//       }
//     });
//   }

 
//   onKvibFileSelected(event: any) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.kvibFile = input.files[0];
//       this.kvibUploadMessage = null;
//     }
//   }

//   uploadKvibFile() {
//     if (!this.kvibFile) return;

//     this.isUploadingKvib = true;
//     this.kvibUploadMessage = "Processing 50k+ trainee records...";
//     this.kvibMessageType = 'info';

//     const formData = new FormData();

//     formData.append("kvibFile", this.kvibFile);

//     this.http.post<any>(`${this.apiUrl}/pmeg-data/upload-kvib`, formData).subscribe({
//       next: (res) => {
//         this.kvibUploadMessage = res.message || 'Trainee data uploaded successfully!';
//         this.kvibMessageType = 'success';
//         this.isUploadingKvib = false;
//         this.kvibFile = null;
//         this.kvibFileInput.nativeElement.value = '';
//       },
//       error: (err) => {
//         this.kvibUploadMessage = "Upload failed: " + (err.error?.message || err.message);
//         this.kvibMessageType = 'error';
//         this.isUploadingKvib = false;
//       }
//     });
//   }
// }

import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
  ]
})
export class AdminComponent {

  private apiUrl = environment.apiUrl;

  /* ===== EXISTING UPLOADS ===== */

  @ViewChild('fileInput') fileInput!: ElementRef;
  mainFile: File | null = null;
  uploadMessage: string | null = null;
  isUploading = false;
  messageType: 'success' | 'error' | 'info' = 'info';

  @ViewChild('agencyFileInput') agencyFileInput!: ElementRef;
  agencyFile: File | null = null;
  agencyUploadMessage: string | null = null;
  isUploadingAgency = false;
  agencyMessageType: 'success' | 'error' | 'info' = 'info';

  @ViewChild('kvibFileInput') kvibFileInput!: ElementRef;
  kvibFile: File | null = null;
  kvibUploadMessage: string | null = null;
  isUploadingKvib = false;
  kvibMessageType: 'success' | 'error' | 'info' = 'info';

  /* ===== NEW PROJECT PDF UPLOAD ===== */

  @ViewChild('projectFileInput') projectFileInput!: ElementRef;

  projectTitle = '';
  projectCost: number | null = null;
  projectPdf: File | null = null;

  projectUploadMessage: string | null = null;
  projectUploading = false;
  projectMessageType: 'success' | 'error' | 'info' = 'info';

  constructor(private http: HttpClient) {}

  /* ===== MAIN FILE ===== */

  onMainFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.mainFile = input.files[0];
      this.uploadMessage = null;
    }
  }

  uploadFiles() {
    if (!this.mainFile) return;

    this.isUploading = true;
    this.uploadMessage = "Uploading main file...";
    this.messageType = 'info';

    const formData = new FormData();
    formData.append("mainExcel", this.mainFile);

    this.http.post<any>(`${this.apiUrl}/pmeg-data/upload`, formData)
      .subscribe({
        next: res => {
          this.uploadMessage = res.message;
          this.messageType = 'success';
          this.isUploading = false;
          this.mainFile = null;
          this.fileInput.nativeElement.value = '';
        },
        error: err => {
          this.uploadMessage = "Upload failed: " +
            (err.error?.message || err.message);
          this.messageType = 'error';
          this.isUploading = false;
        }
      });
  }

  /* ===== AGENCY FILE ===== */

  onAgencyFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.agencyFile = input.files[0];
      this.agencyUploadMessage = null;
    }
  }

  uploadAgencyFile() {
    if (!this.agencyFile) return;

    this.isUploadingAgency = true;
    this.agencyUploadMessage = "Uploading agency file...";
    this.agencyMessageType = 'info';

    const formData = new FormData();
    formData.append("file", this.agencyFile);

    this.http.post<any>(`${this.apiUrl}/pmeg-data/upload-detail`, formData)
      .subscribe({
        next: res => {
          this.agencyUploadMessage = res.message;
          this.agencyMessageType = 'success';
          this.isUploadingAgency = false;
          this.agencyFile = null;
          this.agencyFileInput.nativeElement.value = '';
        },
        error: err => {
          this.agencyUploadMessage = "Upload failed: " +
            (err.error?.message || err.message);
          this.agencyMessageType = 'error';
          this.isUploadingAgency = false;
        }
      });
  }

  /* ===== KVIB FILE ===== */

  onKvibFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.kvibFile = input.files[0];
      this.kvibUploadMessage = null;
    }
  }

  uploadKvibFile() {
    if (!this.kvibFile) return;

    this.isUploadingKvib = true;
    this.kvibUploadMessage = "Processing trainee records...";
    this.kvibMessageType = 'info';

    const formData = new FormData();
    formData.append("kvibFile", this.kvibFile);

    this.http.post<any>(`${this.apiUrl}/pmeg-data/upload-kvib`, formData)
      .subscribe({
        next: res => {
          this.kvibUploadMessage =
            res.message || 'Trainee data uploaded!';
          this.kvibMessageType = 'success';
          this.isUploadingKvib = false;
          this.kvibFile = null;
          this.kvibFileInput.nativeElement.value = '';
        },
        error: err => {
          this.kvibUploadMessage = "Upload failed: " +
            (err.error?.message || err.message);
          this.kvibMessageType = 'error';
          this.isUploadingKvib = false;
        }
      });
  }

  /* ===== PROJECT PDF ===== */

  onProjectFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.projectPdf = input.files[0];
      this.projectUploadMessage = null;
    }
  }

  // uploadProject() {

  //   if (!this.projectTitle || !this.projectCost || !this.projectPdf) {
  //     this.projectUploadMessage = "Fill all fields + select PDF";
  //     this.projectMessageType = 'error';
  //     return;
  //   }

  //   this.projectUploading = true;
  //   this.projectUploadMessage = "Uploading project...";
  //   this.projectMessageType = 'info';

  //   const formData = new FormData();
  //   formData.append("title", this.projectTitle);
  //   formData.append("cost", this.projectCost.toString());
  //   formData.append("pdf", this.projectPdf);

  //   this.http.post(`${this.apiUrl}/projects/upload`, formData)
  //     .subscribe({
  //       next: () => {
  //         this.projectUploadMessage =
  //           "Project uploaded successfully!";
  //         this.projectMessageType = 'success';
  //         this.projectUploading = false;

  //         this.projectTitle = '';
  //         this.projectCost = null;
  //         this.projectPdf = null;
  //         this.projectFileInput.nativeElement.value = '';
  //       },
  //       error: err => {
  //         this.projectUploadMessage = "Upload failed: " +
  //           (err.error?.message || err.message);
  //         this.projectMessageType = 'error';
  //         this.projectUploading = false;
  //       }
  //     });
  // }
  uploadProject() {

    if (!this.projectTitle || !this.projectCost || !this.projectPdf) {
      this.projectUploadMessage = "Fill all fields + select PDF";
      this.projectMessageType = 'error';
      return;
    }

    this.projectUploading = true;
    this.projectUploadMessage = "Uploading project...";
    this.projectMessageType = 'info';

    const formData = new FormData();
    formData.append("title", this.projectTitle);
    formData.append("cost", this.projectCost.toString());
    formData.append("pdf", this.projectPdf);

    this.http.post<any>(`${this.apiUrl}/projects/upload`, formData)
      .subscribe({

        next: (res) => {

          console.log("Upload response:", res);

          this.projectUploadMessage =
            res?.message || "Project uploaded successfully!";
          this.projectMessageType = 'success';

          // reset form
          this.projectTitle = '';
          this.projectCost = null;
          this.projectPdf = null;
          this.projectFileInput.nativeElement.value = '';

        },

        error: (err) => {

          console.error("Upload error:", err);

          this.projectUploadMessage =
            "Upload failed: " +
            (err.error?.message || err.message);

          this.projectMessageType = 'error';

        },

        complete: () => {
          // ✅ ALWAYS stop spinner
          this.projectUploading = false;
        }

      });

  }


}


