import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

import * as L from 'leaflet';

import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';

interface ApplicantRow {
  applicant_name: string;
  applicant_id: string;
  village: string;
  product_desc_activity: string;
  unit_address: string;
  [key: string]: any;
}

interface WorkingFormData {
  unitSector: string;
  unitName: string;
  productsCost: string;
  marketing: string;
  employees: number | null;
  annualProduction: number | null;
  productionValue: number | null;
  annualTurnover: number | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  photos: FileList | null;
}

interface NotWorkingFormData {
  isPresentlyNotWorking: boolean;
  remarks: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  photos: FileList | null;
}

interface ShiftedFormData {
  newAddress: string;
  latitude: number | null; 
  longitude: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  photos: FileList | null;
}

@Component({
  selector: 'app-district-mandal-filter',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    RouterModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatTooltipModule,
    MatToolbarModule
  ],
  templateUrl: './district-mandal-filter.component.html',
  styleUrls: ['./district-mandal-filter.component.css']
})
export class DistrictMandalFilterComponent implements OnInit {

  displayedColumns: string[] = [
    'sl_no', 
    'applicant_name', 
    'village', 
    'applicant_id', 
    'product_desc', 
    'unit_address', 
    'unit_working', 
    'unit_shifted', 
    'actions'
  ];

  districts: any[] = [];
  mandals: any[] = [];
  selectedDistrictId: number | null = null;
  selectedDistrictName: string = '';
  selectedMandal: string = '';
  results: ApplicantRow[] = [];

  rowVerificationStatus = new Map<string, {
    working_status: 'YES' | 'NO' | null,
    not_working_status: 'YES' | 'NO' | null,
    shifted_status: 'YES' | 'NO' | null
  }>();

  isModalOpen = false;
  verificationType: 'working' | 'notWorking' | 'shifted' | '' = '';
  currentApplicant: Partial<ApplicantRow> = {};

  workingFormData: WorkingFormData = this.resetWorkingForm();
  photoPreviews: string[] = [];
  fileErrorMessage: string | null = null;
  workingSelectedPhotos: File[] = [];

  notWorkingFormData: NotWorkingFormData = this.resetNotWorkingForm();
  notWorkingPhotoPreview: string[] = [];
  notWorkingError: string | null = null;

  shiftedFormData: ShiftedFormData = this.resetShiftedForm();
  shiftedPhotoPreview: string[] = [];
  shiftedError: string | null = null;

  map: L.Map | null = null;
  marker: L.Marker | null = null;
  currentActiveModal: 'working' | 'notWorking' | 'shifted' = 'working';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts() {
    this.http.get<any[]>(`${this.apiUrl}/district_mandals/districts`)
      .subscribe(res => this.districts = res);
  }

  onDistrictSelect(event: any) {
    this.selectedDistrictId = event.value;
    const dist = this.districts.find(d => d.id === this.selectedDistrictId);
    this.selectedDistrictName = dist?.name || '';

    this.selectedMandal = '';   // reset search
    this.fetchData();           // load ALL for district
  }

  onMandalSearch() {
    if (!this.selectedDistrictName) return;

    // optional: wait until user types 2 chars
    if (this.selectedMandal && this.selectedMandal.length < 2) return;

    this.fetchData();
  }

  fetchData() {
    if (!this.selectedDistrictName) {
      alert('Please select District');
      return;
    }

    const params: any = { district: this.selectedDistrictName };

    if (this.selectedMandal && this.selectedMandal.trim() !== '') {
      params.mandal = this.selectedMandal;
    }

    this.http.get<any[]>(
      `${this.apiUrl}/district_mandals/verification/total-district-data`,
      { params }
    ).subscribe(data => {
      this.results = data;
      this.initializeStatuses(data);
    });
  }

  initializeStatuses(rows: ApplicantRow[]) {
    this.rowVerificationStatus.clear();
    rows.forEach(a => {
      // Try to load from localStorage first
      const saved = this.loadStatusFromStorage(a.applicant_id);
      this.rowVerificationStatus.set(a.applicant_id, saved || {
        working_status: null,
        not_working_status: null,
        shifted_status: null
      });
    });
  }

  saveStatusToStorage(applicantId: string) {
    const status = this.rowVerificationStatus.get(applicantId);
    if (status) {
      localStorage.setItem(`verification_${applicantId}`, JSON.stringify(status));
    }
  }

  loadStatusFromStorage(applicantId: string) {
    const saved = localStorage.getItem(`verification_${applicantId}`);
    return saved ? JSON.parse(saved) : null;
  }

  openModal(applicant: ApplicantRow, type: 'working' | 'notWorking' | 'shifted') {
    this.currentApplicant = applicant;
    this.verificationType = type;
    this.currentActiveModal = type;
    this.isModalOpen = true;

    this.workingFormData = this.resetWorkingForm();
    this.photoPreviews = [];
    this.fileErrorMessage = null;
    this.workingSelectedPhotos = [];

    this.notWorkingFormData = this.resetNotWorkingForm();
    this.notWorkingPhotoPreview = [];
    this.notWorkingError = null;

    this.shiftedFormData = this.resetShiftedForm();
    this.shiftedPhotoPreview = [];
    this.shiftedError = null;

    // Load existing data from backend if available
    this.loadExistingVerificationData(applicant.applicant_id, type);

    // Initialize map after modal is rendered
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  loadExistingVerificationData(applicantId: string, type: 'working' | 'notWorking' | 'shifted') {
    // Load from localStorage first
    if (type === 'working') {
      const saved = localStorage.getItem(`working_form_${applicantId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.workingFormData = {
            ...this.workingFormData,
            unitSector: data.unitSector || '',
            unitName: data.unitName || '',
            productsCost: data.productsCost || '',
            marketing: data.marketing || '',
            employees: data.employees || null,
            annualProduction: data.annualProduction || null,
            productionValue: data.productionValue || null,
            annualTurnover: data.annualTurnover || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null
          };
          console.log('Loaded working form data from localStorage');
        } catch (e) {
          console.error('Error parsing working form data:', e);
        }
      }
    } else if (type === 'notWorking') {
      const saved = localStorage.getItem(`notworking_form_${applicantId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.notWorkingFormData = {
            ...this.notWorkingFormData,
            remarks: data.remarks || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null
          };
          console.log('Loaded not working form data from localStorage');
        } catch (e) {
          console.error('Error parsing not working form data:', e);
        }
      }
    } else if (type === 'shifted') {
      const saved = localStorage.getItem(`shifted_form_${applicantId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.shiftedFormData = {
            ...this.shiftedFormData,
            newAddress: data.newAddress || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null
          };
          console.log('Loaded shifted form data from localStorage');
        } catch (e) {
          console.error('Error parsing shifted form data:', e);
        }
      }
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.verificationType = '';
    this.currentApplicant = {};
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.marker) {
      this.marker = null;
    }
  }

  resetWorkingForm(): WorkingFormData {
    return {
      unitSector: '',
      unitName: '',
      productsCost: '',
      marketing: '',
      employees: null,
      annualProduction: null,
      productionValue: null,
      annualTurnover: null,
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      photos: null
    };
  }

  resetNotWorkingForm(): NotWorkingFormData {
    return {
      isPresentlyNotWorking: true,
      remarks: '',
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      photos: null
    };
  }

  resetShiftedForm(): ShiftedFormData {
    return {
      newAddress: '',
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      photos: null
    };
  }

  onFileChange(event: any, formModel: WorkingFormData) {
    const files = event.target.files;
    this.fileErrorMessage = null;
    this.photoPreviews = [];

    if (files.length > 5) {
      this.fileErrorMessage = "Maximum 5 photos allowed";
      event.target.value = '';
      return;
    }

    formModel.photos = files;

    for (let i = 0; i < files.length; i++) {
      this.photoPreviews.push(URL.createObjectURL(files[i]));
    }
  }

  // Image compression method
  async compressImage(file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle photo input with compression (for camera capture)
  async onWorkingPhotoInput(event: any) {
    const files: FileList = event.target.files;
    this.fileErrorMessage = null;

    if (!files || files.length === 0) return;

    const totalPhotos = this.workingSelectedPhotos.length + files.length;
    if (totalPhotos > 5) {
      this.fileErrorMessage = `Maximum 5 photos allowed. You have ${this.workingSelectedPhotos.length}, trying to add ${files.length}.`;
      event.target.value = '';
      return;
    }

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await this.compressImage(files[i]);
        this.workingSelectedPhotos.push(compressed);
        this.photoPreviews.push(URL.createObjectURL(compressed));
      } catch (err) {
        console.error('Error compressing image:', err);
        this.workingSelectedPhotos.push(files[i]);
        this.photoPreviews.push(URL.createObjectURL(files[i]));
      }
    }

    event.target.value = '';
  }

  // Remove a selected photo
  removeWorkingPhoto(index: number) {
    this.workingSelectedPhotos.splice(index, 1);
    this.photoPreviews.splice(index, 1);
  }

  onNotWorkingFileChange(event: any) {
    const files = event.target.files;
    this.notWorkingError = null;
    this.notWorkingPhotoPreview = [];

    if (files.length > 5) {
      this.notWorkingError = "Maximum 5 photos allowed";
      return;
    }

    this.notWorkingFormData.photos = files;
    for (let i = 0; i < files.length; i++) {
      this.notWorkingPhotoPreview.push(URL.createObjectURL(files[i]));
    }
  }

  onShiftedFileChange(event: any) {
    const files = event.target.files;
    this.shiftedError = null;
    this.shiftedPhotoPreview = [];

    if (files.length > 5) {
      this.shiftedError = "Maximum 5 photos allowed";
      return;
    }

    this.shiftedFormData.photos = files;
    for (let i = 0; i < files.length; i++) {
      this.shiftedPhotoPreview.push(URL.createObjectURL(files[i]));
    }
  }

  submitWorkingForm() {
    if (!this.currentApplicant.applicant_id) {
      alert("Applicant not selected.");
      return;
    }

    if (this.workingSelectedPhotos.length === 0) {
      this.fileErrorMessage = 'At least one photo is required.';
      return;
    }

    const applicantId = this.currentApplicant.applicant_id;
    const formData = new FormData();

    this.workingSelectedPhotos.forEach(file =>
      formData.append("working_photos", file)
    );

    // Save form data to localStorage for retrieval later
    const workingDataToSave = {
      unitSector: this.workingFormData.unitSector,
      unitName: this.workingFormData.unitName,
      productsCost: this.workingFormData.productsCost,
      marketing: this.workingFormData.marketing,
      employees: this.workingFormData.employees,
      annualProduction: this.workingFormData.annualProduction,
      productionValue: this.workingFormData.productionValue,
      annualTurnover: this.workingFormData.annualTurnover,
      latitude: this.workingFormData.latitude,
      longitude: this.workingFormData.longitude
    };
    localStorage.setItem(`working_form_${applicantId}`, JSON.stringify(workingDataToSave));

    formData.append("data", JSON.stringify({
      applicant_id: applicantId,
      working_form: {
        unit_sector: this.workingFormData.unitSector,
        unit_name: this.workingFormData.unitName,
        products_cost: this.workingFormData.productsCost,
        marketing: this.workingFormData.marketing,
        employees: this.workingFormData.employees,
        annual_production: this.workingFormData.annualProduction,
        production_value: this.workingFormData.productionValue,
        annual_turnover: this.workingFormData.annualTurnover
      },
      latitude: this.workingFormData.latitude,
      longitude: this.workingFormData.longitude,
      address: this.workingFormData.address,
      city: this.workingFormData.city,
      state: this.workingFormData.state,
      country: this.workingFormData.country,
      pincode: this.workingFormData.pincode
    }));

    this.http.post(`${this.apiUrl}/verification/working-details`, formData)
      .subscribe({
        next: () => {
          alert("Working details saved successfully.");
          const st = this.rowVerificationStatus.get(applicantId)!;
          st.working_status = "YES";
          st.not_working_status = null;
          st.shifted_status = null;
          this.rowVerificationStatus.set(applicantId, st);
          this.saveStatusToStorage(applicantId);
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          alert("Failed to save working details.");
        }
      });
  }

  submitNotWorkingForm() {
    if (!this.currentApplicant.applicant_id) {
      alert("Applicant not selected");
      return;
    }

    const formData = new FormData();
    const applicantId = this.currentApplicant.applicant_id;

    if (this.notWorkingFormData.photos) {
      Array.from(this.notWorkingFormData.photos).forEach((file: File) =>
        formData.append("not_working_photos", file)
      );
    }

    // Save form data to localStorage
    const notWorkingDataToSave = {
      remarks: this.notWorkingFormData.remarks,
      latitude: this.notWorkingFormData.latitude,
      longitude: this.notWorkingFormData.longitude
    };
    localStorage.setItem(`notworking_form_${applicantId}`, JSON.stringify(notWorkingDataToSave));

    formData.append("data", JSON.stringify({
      applicant_id: applicantId,
      remarks: this.notWorkingFormData.remarks,
      latitude: this.notWorkingFormData.latitude,
      longitude: this.notWorkingFormData.longitude,
      address: this.notWorkingFormData.address,
      city: this.notWorkingFormData.city,
      state: this.notWorkingFormData.state,
      country: this.notWorkingFormData.country,
      pincode: this.notWorkingFormData.pincode
    }));

    this.http.post(`${this.apiUrl}/verification/not-working-details`, formData)
      .subscribe({
        next: () => {
          alert("Not working details saved successfully.");
          const st = this.rowVerificationStatus.get(applicantId)!;
          st.not_working_status = "YES";
          st.working_status = null;
          st.shifted_status = null;
          this.rowVerificationStatus.set(applicantId, st);
          this.saveStatusToStorage(applicantId);
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          alert("Failed to save Not Working details.");
        }
      });
  }

  submitShiftedForm() {
    if (!this.currentApplicant.applicant_id) {
      alert("Applicant not selected");
      return;
    }

    if (!this.shiftedFormData.newAddress || this.shiftedFormData.newAddress.trim().length === 0) {
      alert("Please enter the new address.");
      return;
    }
    const formData = new FormData();
    const applicantId = this.currentApplicant.applicant_id;

    if (this.shiftedFormData.photos) {
      Array.from(this.shiftedFormData.photos).forEach((file: File) =>
        formData.append("shifted_photos", file)
      );
    }

    // Save form data to localStorage
    const shiftedDataToSave = {
      newAddress: this.shiftedFormData.newAddress,
      latitude: this.shiftedFormData.latitude,
      longitude: this.shiftedFormData.longitude
    };
    localStorage.setItem(`shifted_form_${applicantId}`, JSON.stringify(shiftedDataToSave));

    formData.append("data", JSON.stringify({
      applicant_id: applicantId,
      new_address: this.shiftedFormData.newAddress,
      latitude: this.shiftedFormData.latitude,
      longitude: this.shiftedFormData.longitude,
      address: this.shiftedFormData.address,
      city: this.shiftedFormData.city,
      state: this.shiftedFormData.state,
      country: this.shiftedFormData.country,
      pincode: this.shiftedFormData.pincode
    }));

    this.http.post(`${this.apiUrl}/verification/shifted-details`, formData)
      .subscribe({
        next: () => {
          alert("Shifted details saved successfully.");
          const st = this.rowVerificationStatus.get(applicantId)!;
          st.shifted_status = "YES";
          st.working_status = null;
          st.not_working_status = null;
          this.rowVerificationStatus.set(applicantId, st);
          this.saveStatusToStorage(applicantId);
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          alert("Failed to save shifted details.");
        }
      });
  }

  sendNoStatus(applicant: ApplicantRow, type: any) {
    const st = this.rowVerificationStatus.get(applicant.applicant_id)!;

    if (type === "working") {
      st.working_status = st.working_status === "NO" ? null : "NO";
    }
    if (type === "notWorking") {
      st.not_working_status = st.not_working_status === "NO" ? null : "NO";
    }
    if (type === "shifted") {
      st.shifted_status = st.shifted_status === "NO" ? null : "NO";
    }

    this.rowVerificationStatus.set(applicant.applicant_id, st);
    this.saveStatusToStorage(applicant.applicant_id); // Save to localStorage
  }

  submitRowVerification(applicant: ApplicantRow) {
    const status = this.rowVerificationStatus.get(applicant.applicant_id)!;

    // Check if all statuses are null/unselected
    if (!status.working_status && !status.not_working_status && !status.shifted_status) {
      alert("Please select at least one option (Yes/No) before submitting.");
      return;
    }

    const payload = {
      applicant_id: applicant.applicant_id,
      applicant_name: applicant.applicant_name,
      district: this.selectedDistrictName,
      mandal: this.selectedMandal,
      village: applicant.village,
      product_desc_activity: applicant.product_desc_activity,
      unit_address: applicant.unit_address,
      working_status: status.working_status,
      not_working_status: status.not_working_status,
      shifted_status: status.shifted_status
    };

    this.http.post(`${this.apiUrl}/verification/submit`, payload)
      .subscribe({
        next: () => {
          alert("Verification status saved.");
          this.saveStatusToStorage(applicant.applicant_id); // Save to localStorage
        },
        error: () => alert("Error saving verification status.")
      });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          if (this.verificationType === 'working') {
            this.workingFormData.latitude = latitude;
            this.workingFormData.longitude = longitude;
          } else if (this.verificationType === 'notWorking') {
            this.notWorkingFormData.latitude = latitude;
            this.notWorkingFormData.longitude = longitude;
          } else if (this.verificationType === 'shifted') {
            this.shiftedFormData.latitude = latitude;
            this.shiftedFormData.longitude = longitude;
          }

          // Update map with new location
          this.updateMapLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          let msg = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg += ' You denied the request for Geolocation.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg += ' Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg += ' The request timed out.';
          }
          alert(msg + ' Please enable GPS.');
        },
        options
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  initializeMap() {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer || this.map) {
      return;
    }

    // Default center (India center)
    const defaultLat = 20.5937;
    const defaultLng = 78.9629;

    this.map = L.map('location-map').setView([defaultLat, defaultLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add marker if location is already set
    const lat = this.verificationType === 'working' ? this.workingFormData.latitude :
                this.verificationType === 'notWorking' ? this.notWorkingFormData.latitude :
                this.verificationType === 'shifted' ? this.shiftedFormData.latitude : null;

    const lng = this.verificationType === 'working' ? this.workingFormData.longitude :
                this.verificationType === 'notWorking' ? this.notWorkingFormData.longitude :
                this.verificationType === 'shifted' ? this.shiftedFormData.longitude : null;

    if (lat && lng) {
      this.updateMapLocation(lat, lng);
    }
  }

  updateMapLocation(latitude: number, longitude: number) {
    if (!this.map) {
      return;
    }

    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Create custom marker icon with proper styling
    const markerIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add new marker with custom icon - initially showing coordinates
    this.marker = L.marker([latitude, longitude], { icon: markerIcon })
      .addTo(this.map)
      .bindPopup(`<div style="font-size: 12px; line-height: 1.6;"><b>📍 Loading...</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}</div>`);

    // Center map on marker
    this.map.setView([latitude, longitude], 15);
    this.marker.openPopup();

    // Fetch and populate address details from coordinates
    this.fetchAddressFromCoordinates(latitude, longitude);
  }

  fetchAddressFromCoordinates(latitude: number, longitude: number) {
    // Use Nominatim reverse geocoding API to fetch address from coordinates
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    this.http.get<any>(url).subscribe(
      (response) => {
        const address = response.address || {};
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        const country = address.country || '';
        const fullAddress = response.display_name || '';

        // Populate address fields for the active form based on current modal
        if (this.currentActiveModal === 'working') {
          this.workingFormData.address = fullAddress;
          this.workingFormData.city = city;
          this.workingFormData.state = state;
          this.workingFormData.country = country;
          this.workingFormData.pincode = address.postcode || '';
        } else if (this.currentActiveModal === 'notWorking') {
          this.notWorkingFormData.address = fullAddress;
          this.notWorkingFormData.city = city;
          this.notWorkingFormData.state = state;
          this.notWorkingFormData.country = country;
          this.notWorkingFormData.pincode = address.postcode || '';
        } else if (this.currentActiveModal === 'shifted') {
          this.shiftedFormData.address = fullAddress;
          this.shiftedFormData.city = city;
          this.shiftedFormData.state = state;
          this.shiftedFormData.country = country;
          this.shiftedFormData.pincode = address.postcode || '';
        }

        // Update marker popup with fetched address details
        if (this.marker) {
          const popupContent = `
            <div style="font-size: 12px; line-height: 1.6;">
              <b>📍 Location Details</b><br>
              <strong>${city}</strong><br>
              ${state ? state + '<br>' : ''}
              ${country ? country + '<br>' : ''}
              <small style="color: #666;">
                Lat: ${latitude.toFixed(6)}<br>
                Lng: ${longitude.toFixed(6)}
              </small>
            </div> 
          `;
          this.marker.setPopupContent(popupContent);
          this.marker.openPopup();
        }
      },
      (error) => {
        console.error('Error fetching address from coordinates:', error);
        // Silently fail - user can manually enter address if needed
      }
    );
  }
}
