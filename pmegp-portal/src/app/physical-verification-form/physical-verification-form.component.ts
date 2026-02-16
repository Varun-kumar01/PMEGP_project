import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VerificationService } from '../services/verification.service';

@Component({
  selector: 'app-physical-verification-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './physical-verification-form.component.html',
  styleUrls: ['./physical-verification-form.component.css']
})
export class PhysicalVerificationFormComponent implements OnInit {
  verificationForm: FormGroup;
  fileErrorMessage: string | null = null;
  photoPreviews: string[] = [];
  isLoading = false; 

  constructor(
    private fb: FormBuilder,
    private verificationService: VerificationService 
  ) {
    this.verificationForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.verificationForm = this.fb.group({
      beneficiaryNameAddress: ['', Validators.required],
      unitLocation: ['', Validators.required],
      photos: [null, Validators.required],
      financingBankName: ['', Validators.required],
      financingBankAddress: [''],
      financingBranchName: ['', Validators.required],
      ifscCode: ['', Validators.required],
      financingBankPhone: [''],
      pmegpApplicationId: ['', Validators.required],
      beneficiaryContact: ['', Validators.required],
      loanSanctioned: this.fb.group({ tl: [], cc: [], total: [] }),
      loanReleased: this.fb.group({ tl: [], cc: [], total: [] }),
      ownContribution: [],
      firstInstallmentDate: [''],
      balanceLoanToBeReleased: [],
      workingCapitalUtilization: this.fb.group({
        is100Percent: [''],
        amountIfNot: ['']
      }),
      rateOfInterest: [],
      mmSubsidyAmountReceived: [],
      mmSubsidyReceivedDate: [''],
      tdrFundAmount: [],
      tdrFundNumber: [''],
      tdrFundDate: [''],
      cgtmseCoverage: [''],
      interestChargedOnMM: [''],
      collateralSecurityObtained: [''],
      collateralSecurityValue: [],
      repayment: this.fb.group({
        isRegular: [''],
        npaDate: ['']
      }),
      otherRemarks: ['']
    });
  }

  onFileChange(event: any) {
    const files = event.target.files;
    this.fileErrorMessage = null;
    this.photoPreviews = [];
    this.photosControl?.setErrors(null);

    if (files.length > 5) {
      this.fileErrorMessage = 'You can only upload a maximum of 5 photos.';
      event.target.value = null;
      this.photosControl?.setValue(null);
      this.photosControl?.setErrors({ 'maxFiles': true });
      return;
    }

    if (files.length > 0) {
      this.photosControl?.setValue(files); 


      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        this.photoPreviews.push(url);
      }
      console.log('Selected files:', files);
    } else {
      this.photosControl?.setValue(null);
    }
  }


  onSubmit() {
    if (!this.verificationForm.valid) {
      alert('Form is invalid. Please fill in all required fields.');
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.verificationForm.value;


    const files: FileList = this.photosControl?.value;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
    }

    const dataToSend = { ...formValue };
    delete dataToSend.photos; 

  
    formData.append('data', JSON.stringify(dataToSend));


    this.verificationService.submitForm(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Submission successful', response);
        alert('Form submitted successfully!');
        this.verificationForm.reset();
        this.photoPreviews = []; 
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Submission failed', error);
        alert('An error occurred during submission. Please try again.');
      }
    });
  }

  get photosControl() {
    return this.verificationForm.get('photos');
  }
}

