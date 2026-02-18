import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';


import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';

import * as L from 'leaflet';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

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
  photos: FileList | null;
}

interface NotWorkingFormData {
  remarks: string;
  latitude: number | null;
  longitude: number | null;
  photos: FileList | null;
}

@Component({
  selector: 'app-cbc-data-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatRadioModule,
    MatDividerModule
  ],
  templateUrl: './cbc-data-verification.component.html',
  styleUrl: './cbc-data-verification.component.css'
})
export class CbcDataVerificationComponent implements OnInit {

  districts: any[] = [];
  selectedDistrict = '';
  searchMandal = '';
  cbcData: any[] = [];
  allCbcData: any[] = [];
  isLoading = false;


  isModalOpen = false;
  verificationType: 'working' | 'notWorking' | null = null;
  currentBorrower: any = {};
  

  workingFormData: WorkingFormData = {
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
    photos: null
  };
  photoPreviews: string[] = [];
  fileErrorMessage = '';


  notWorkingFormData: NotWorkingFormData = {
    remarks: '',
    latitude: null,
    longitude: null,
    photos: null
  };
  notWorkingPhotoPreview: string[] = [];
  notWorkingError = '';

  private apiUrl = environment.apiUrl;

  map: L.Map | null = null;
  marker: L.Marker | null = null;
  currentActiveModal: 'working' | 'notWorking' = 'working';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDistricts();
  }

  loadDistricts() {
    this.http.get<any[]>(`${this.apiUrl}/district_mandals/districts`)
      .subscribe(res => this.districts = res);
  }

  onDistrictSelect(event: any) {
    this.selectedDistrict = event.value;
    this.searchMandal = '';
    if (this.selectedDistrict) {
      this.fetchData();
    } else {
      this.cbcData = [];
      this.allCbcData = [];
    }
  }

  fetchData() {
    if (!this.selectedDistrict) {
      return;
    }

    this.isLoading = true;

    this.http.get<any[]>(`${this.apiUrl}/cbc-data`, {
      params: { district: this.selectedDistrict }
    }).subscribe({
      next: (data) => {
        this.allCbcData = data.map(r => ({ ...r, present_status: '' }));
        this.cbcData = [...this.allCbcData];
        this.isLoading = false;
      },
      error: () => {
        alert('Failed to load CBC Data');
        this.isLoading = false;
      }
    });
  }

  onMandalSearch() {
    if (!this.searchMandal.trim()) {
      this.cbcData = [...this.allCbcData];
    } else {
      const term = this.searchMandal.toLowerCase().trim();
      this.cbcData = this.allCbcData.filter(row =>
        row.mandal && row.mandal.toLowerCase().includes(term)
      );
    }
  }

  setStatus(index: number, status: string) {
    this.cbcData[index].present_status = status;
  }


  submitVerification(row: any) {
    if (!row.present_status) {
      alert('Please select Working or Not Working status first');
      return;
    }


    if (row.present_status === 'Working') {
      if (!this.workingFormData.unitSector || !this.workingFormData.unitName) {
        alert('Please fill the Working form details first');
        this.openWorkingModal(row);
        return;
      }
    } else if (row.present_status === 'Not Working') {
      if (!this.notWorkingFormData.remarks) {
        alert('Please fill the Not Working form details first');
        this.openNotWorkingModal(row);
        return;
      }
    }


    this.submitFinalVerification(row);
  }


  submitFinalVerification(row: any) {
    
    let yearOfSanction = row.year_of_sanction;
    if (yearOfSanction && typeof yearOfSanction === 'string') {
      yearOfSanction = yearOfSanction.split('-')[0]; 
    }

    const payload = {
      name_of_borrower: row.name_and_address_borrower,
      district: row.district,
      mandal: row.mandal,
      village: row.village,
      year_of_sanction: yearOfSanction,
      name_of_industry: row.industry,
      sanctioned_mm: row.sanctioned_mm,
      sanctioned_total: row.sanctioned_total,
      final_status: row.present_status 
    };

    this.http.post(`${this.apiUrl}/cbc-verified-data`, payload)
      .subscribe({
        next: () => {
          alert('CBC Verification Submitted Successfully');
          
          this.fetchData();
        },
        error: (err) => {
          console.error('Error submitting final verification:', err);
          alert('Error submitting final verification');
        }
      });
  }


  openWorkingModal(row: any) {
    this.verificationType = 'working';
    this.currentActiveModal = 'working';
    this.currentBorrower = row;
    this.isModalOpen = true;
    this.resetWorkingForm();
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  openNotWorkingModal(row: any) {
    this.verificationType = 'notWorking';
    this.currentActiveModal = 'notWorking';
    this.currentBorrower = row;
    this.isModalOpen = true;
    this.resetNotWorkingForm();
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  closeModal() {
    this.isModalOpen = false;
    this.verificationType = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.marker) {
      this.marker = null;
    }
    this.resetWorkingForm();
    this.resetNotWorkingForm();
  }


  resetWorkingForm() {
    this.workingFormData = {
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
      photos: null
    };
    this.photoPreviews = [];
    this.fileErrorMessage = '';
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      // Show loading state
      const loadingAlert = 'Getting your precise location...';
      console.log(loadingAlert);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          
          console.log(`Location acquired - Latitude: ${lat}, Longitude: ${lng}, Accuracy: ${accuracy.toFixed(2)}m`);
          
          if (this.currentActiveModal === 'working') {
            this.workingFormData.latitude = parseFloat(lat.toFixed(7));
            this.workingFormData.longitude = parseFloat(lng.toFixed(7));
          } else if (this.currentActiveModal === 'notWorking') {
            this.notWorkingFormData.latitude = parseFloat(lat.toFixed(7));
            this.notWorkingFormData.longitude = parseFloat(lng.toFixed(7));
          }
          
          this.updateMapLocation(lat, lng);
          this.fetchAddressFromCoordinates(lat, lng);
          
          // Show accuracy feedback
          // if (accuracy <= 10) {
          //   alert(`Location captured with high accuracy (±${accuracy.toFixed(1)}m)`);
          // } else if (accuracy <= 50) {
          //   alert(`Location captured with good accuracy (±${accuracy.toFixed(1)}m)`);
          // } else {
          //   alert(`Location captured but accuracy is low (±${accuracy.toFixed(1)}m). Consider moving to a clearer area.`);
          // }
        },
        (error) => {
          let errorMessage = 'Unable to get location: ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Please check your device GPS.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage += error.message;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,      // Use GPS for highest accuracy
          timeout: 10000,                // Wait up to 10 seconds
          maximumAge: 0                  // Don't use cached position
        }
      );
    } else {
      alert('Geolocation not supported by browser');
    }
  }

  initializeMap() {
    const defaultLat = this.currentActiveModal === 'working' 
      ? (this.workingFormData.latitude || 15.8)
      : (this.notWorkingFormData.latitude || 15.8);
    const defaultLng = this.currentActiveModal === 'working'
      ? (this.workingFormData.longitude || 78.1)
      : (this.notWorkingFormData.longitude || 78.1);

    const mapElement = document.getElementById('location-map');
    if (!mapElement) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('location-map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    if ((this.currentActiveModal === 'working' && this.workingFormData.latitude && this.workingFormData.longitude) ||
        (this.currentActiveModal === 'notWorking' && this.notWorkingFormData.latitude && this.notWorkingFormData.longitude)) {
      const lat = this.currentActiveModal === 'working' ? this.workingFormData.latitude! : this.notWorkingFormData.latitude!;
      const lng = this.currentActiveModal === 'working' ? this.workingFormData.longitude! : this.notWorkingFormData.longitude!;
      this.addMarker(lat, lng);
    }
  }

  addMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.remove();
    }
    this.marker = L.marker([lat, lng]).addTo(this.map!);
  }

  updateMapLocation(latitude: number, longitude: number) {
    if (!this.map) {
      this.initializeMap();
    }
    this.map!.setView([latitude, longitude], 13);
    this.addMarker(latitude, longitude);
  }

  fetchAddressFromCoordinates(latitude: number, longitude: number) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    this.http.get<any>(nominatimUrl).subscribe({
      next: (response) => {
        if (response && response.address) {
          const addr = response.address;
          const addressParts = [];
          
          if (addr.road) addressParts.push(addr.road);
          if (addr.village) addressParts.push(addr.village);
          if (addr.town) addressParts.push(addr.town);
          if (addr.city) addressParts.push(addr.city);
          if (addr.county) addressParts.push(addr.county);
          if (addr.state) addressParts.push(addr.state);
          if (addr.country) addressParts.push(addr.country);
          
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          console.log('Address:', fullAddress);
        }
      },
      error: () => {
        console.log('Failed to fetch address from coordinates');
      }
    });
  }

  onFileChange(event: any, formData: any) {
    const files = event.target.files;
    if (files && files.length > 5) {
      this.fileErrorMessage = 'Maximum 5 photos allowed';
      return;
    }
    
    this.fileErrorMessage = '';
    this.photoPreviews = [];
    
    if (files) {
      formData.photos = files;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.photoPreviews.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  submitWorkingForm() {
    if (!this.workingFormData.unitSector || !this.workingFormData.unitName) {
      alert('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    

    const jsonData = {
      borrower_name: this.currentBorrower.name_and_address_borrower,
      district: this.currentBorrower.district,
      mandal: this.currentBorrower.mandal,
      village: this.currentBorrower.village,
      year: this.currentBorrower.year_of_sanction,
      industry: this.currentBorrower.industry,
      mm: this.currentBorrower.sanctioned_mm,
      total: this.currentBorrower.sanctioned_total,
      working_form: {
        unit_sector: this.workingFormData.unitSector,
        unit_name: this.workingFormData.unitName,
        products_cost: this.workingFormData.productsCost,
        marketing: this.workingFormData.marketing,
        employees: this.workingFormData.employees || 0,
        annual_production: this.workingFormData.annualProduction || 0,
        production_value: this.workingFormData.productionValue || 0,
        annual_turnover: this.workingFormData.annualTurnover || 0
      },
      latitude: this.workingFormData.latitude || 0,
      longitude: this.workingFormData.longitude || 0
    };
    
    formData.append('data', JSON.stringify(jsonData));
    
    if (this.workingFormData.photos) {
      for (let i = 0; i < this.workingFormData.photos.length; i++) {
        formData.append('working_photos', this.workingFormData.photos[i]);
      }
    }

    this.http.post(`${this.apiUrl}/cbc/submit-working`, formData)
      .subscribe({
        next: () => {
          alert('Working details submitted successfully');
          this.currentBorrower.present_status = 'Working';

          this.isModalOpen = false;
          this.verificationType = null;
        },
        error: (err) => {
          console.error('Error submitting working form:', err);
          alert('Error submitting working form');
        }
      });
  }


  resetNotWorkingForm() {
    this.notWorkingFormData = {
      remarks: '',
      latitude: null,
      longitude: null,
      photos: null
    };
    this.notWorkingPhotoPreview = [];
    this.notWorkingError = '';
  }

  onNotWorkingFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 5) {
      this.notWorkingError = 'Maximum 5 photos allowed';
      return;
    }
    
    this.notWorkingError = '';
    this.notWorkingPhotoPreview = [];
    
    if (files) {
      this.notWorkingFormData.photos = files;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.notWorkingPhotoPreview.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  submitNotWorkingForm() {
    if (!this.notWorkingFormData.remarks) {
      alert('Please provide remarks/reason');
      return;
    }

    const formData = new FormData();
    

    const jsonData = {
      borrower_name: this.currentBorrower.name_and_address_borrower,
      district: this.currentBorrower.district,
      mandal: this.currentBorrower.mandal,
      village: this.currentBorrower.village,
      year: this.currentBorrower.year_of_sanction,
      industry: this.currentBorrower.industry,
      mm: this.currentBorrower.sanctioned_mm,
      total: this.currentBorrower.sanctioned_total,
      remarks: this.notWorkingFormData.remarks,
      latitude: this.notWorkingFormData.latitude || 0,
      longitude: this.notWorkingFormData.longitude || 0
    };
    
    formData.append('data', JSON.stringify(jsonData));
    
    if (this.notWorkingFormData.photos) {
      for (let i = 0; i < this.notWorkingFormData.photos.length; i++) {
        formData.append('not_working_photos', this.notWorkingFormData.photos[i]);
      }
    }

    this.http.post(`${this.apiUrl}/cbc/submit-not-working`, formData)
      .subscribe({
        next: () => {
          alert('Not working confirmation submitted successfully');
          this.currentBorrower.present_status = 'Not Working';

          this.isModalOpen = false;
          this.verificationType = null;
        },
        error: (err) => {
          console.error('Error submitting not working form:', err);
          alert('Error submitting not working form');
        }
      });
  }
}
