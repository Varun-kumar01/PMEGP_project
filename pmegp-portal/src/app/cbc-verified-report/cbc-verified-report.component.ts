import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LeafletMapService } from '../services/leaflet-map.service';
import { environment } from '../../environments/environment';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-cbc-verified-report',
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
    MatDividerModule
  ],
  templateUrl: './cbc-verified-report.component.html',
  styleUrls: ['./cbc-verified-report.component.css']
})
export class CbcVerifiedReportComponent implements OnInit {

  districts: any[] = [];
  selectedDistrict = '';
  cbcData: any[] = [];
  isLoading = false;
  private apiUrl = environment.apiUrl;


  isModalOpen = false;
  modalType: 'working' | 'notWorking' | '' = '';
  modalTitle = '';
  selectedRow: any = {};

  isViewerOpen = false;
  currentImage = '';
  currentImageList: string[] = [];
  currentImageIndex = 0;

  constructor(private http: HttpClient, private mapService: LeafletMapService) {}

  ngOnInit() {
    this.loadDistricts();
  }

  loadDistricts() {
    this.http.get<any[]>(`${this.apiUrl}/district_mandals/districts`)
      .subscribe(res => this.districts = res);
  }

  onDistrictSelect(event: any) {
    this.selectedDistrict = event.value;
  }

  fetchData() {
    if (!this.selectedDistrict) {
      alert('Please select a District');
      return;
    }

    this.isLoading = true;
    

    this.http.get<any>(`${this.apiUrl}/cbc-verified-report`, {
      params: { district: this.selectedDistrict }
    }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.cbcData = res.data;
        } else {
          this.cbcData = [];
          alert(res.message || 'No data found for this district.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load Verified CBC Data');
        this.isLoading = false;
      }
    });
  }


  openDetailModal(row: any, type: 'working' | 'notWorking') {
    this.selectedRow = row;
    this.modalType = type;
    this.modalTitle = type === 'working' ? 'Unit Working Details' : 'Unit Not Working Details';
    this.isModalOpen = true;
    
    // Initialize map after modal opens
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedRow = {};
    // Destroy map
    this.mapService.destroyMap();
  }


  getPhotos(raw: any): string[] {
    if (!raw) return [];
    
 
    if (Array.isArray(raw)) {
      return raw.map(p => this.normalizePhotoUrl(p));
    }

 
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => this.normalizePhotoUrl(p));
        }
      } catch (e) {
      
        return [this.normalizePhotoUrl(raw)];
      }
    }
    return [];
  }

  normalizePhotoUrl(p: string): string {
    if (!p) return '';
    let url = p.replace(/\\/g, '/');
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) url = url.substring(1);
    return `${this.apiUrl}/${url}`;
  }

  initializeMap() {
    let lat: number | undefined;
    let lng: number | undefined;

    // Get coordinates based on modal type
    if (this.modalType === 'working') {
      lat = this.selectedRow.working_latitude;
      lng = this.selectedRow.working_longitude;
    } else if (this.modalType === 'notWorking') {
      lat = this.selectedRow.not_working_latitude;
      lng = this.selectedRow.not_working_longitude;
    }

    if (!lat || !lng) {
      return;
    }

    // Initialize map using the service
    try {
      this.mapService.initializeMap({
        containerId: 'mapContainerCbc',
        latitude: lat,
        longitude: lng,
        zoom: 13
      });

      // Fetch address and add marker
      this.mapService.getAddressFromCoordinates(lat, lng).then((address) => {
        const popupContent = this.mapService.createPopupContent(
          this.selectedRow.applicant_name,
          lat!,
          lng!,
          address,
          {
            'Mandal': this.selectedRow.mandal,
            'District': this.selectedRow.district,
            'Unit Address': this.selectedRow.unit_address
          }
        );
        this.mapService.addMarker({
          latitude: lat!,
          longitude: lng!,
          popupContent,
          openPopup: true
        });
      }).catch(() => {
        // Fallback if Nominatim fails
        const popupContent = this.mapService.createPopupContent(
          this.selectedRow.applicant_name,
          lat!,
          lng!,
          this.selectedRow.unit_address,
          {
            'Mandal': this.selectedRow.mandal,
            'District': this.selectedRow.district
          }
        );
        this.mapService.addMarker({
          latitude: lat!,
          longitude: lng!,
          popupContent,
          openPopup: true
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  openImageViewer(images: string[], idx: number) {
    this.currentImageList = images;
    this.currentImageIndex = idx;
    this.currentImage = images[idx];
    this.isViewerOpen = true;
  }

  closeImageViewer(event?: any) {

    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('image-viewer-overlay') && target.tagName !== 'BUTTON') {
        return;
      }
    }
    this.isViewerOpen = false;
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageList.length === 0) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImageList.length;
    this.currentImage = this.currentImageList[this.currentImageIndex];
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageList.length === 0) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.currentImageList.length) % this.currentImageList.length;
    this.currentImage = this.currentImageList[this.currentImageIndex];
  }
}