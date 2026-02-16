
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { LeafletMapService } from '../services/leaflet-map.service';
import { environment } from '../../environments/environment';

interface ReportRow {
  applicant_id: string;
  applicant_name: string;
  mandal: string;
  district: string;
  product_desc_activity: string;
  unit_address: string;
  working_status?: string;
  not_working_status?: string;
  shifted_status?: string;
  working_latitude?: number;
  working_longitude?: number;
  not_working_latitude?: number;
  not_working_longitude?: number;
  shifted_latitude?: number;
  shifted_longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  unit_sector?: string;
  unit_name?: string;
  products_cost?: string;
  marketing_scope?: string;
  employee_count?: number;
  annual_production_qty?: string;
  annual_production_value?: string;
  annual_turnover?: string;
  working_photos?: any;
  not_working_remarks?: string;
  not_working_photos?: any;
  shifted_new_address?: string;
  shifted_photos?: any;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private apiUrl = environment.apiUrl;
  districts: any[] = [];
  mandals: any[] = [];
  selectedDistrictId: number | null = null;
  selectedDistrictName = '';
  selectedMandal = '';

  reports: ReportRow[] = [];
  isLoading = false;

  isModalOpen = false;
  modalType: 'working' | 'notWorking' | 'shifted' | '' = '';
  modalTitle = '';
  selectedRow: ReportRow = {} as ReportRow;

  isViewerOpen = false;
  currentImage = '';
  currentImageList: string[] = [];
  currentImageIndex = 0;

  constructor(private http: HttpClient, private mapService: LeafletMapService) {}

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
    this.loadReport();          // load ALL for district
  }

  onMandalSearch() {
    if (!this.selectedDistrictName) return;

    // optional: wait until user types 2 chars
    if (this.selectedMandal && this.selectedMandal.length < 2) return;

    this.loadReport();
  }

  loadReport() {
    if (!this.selectedDistrictName) {
      alert('Please select District');
      return;
    }

    this.isLoading = true;
    let params = new HttpParams().set('district', this.selectedDistrictName);

    if (this.selectedMandal && this.selectedMandal.trim() !== '') {
      params = params.set('mandal', this.selectedMandal);
    }

    this.http.get<any>(`${this.apiUrl}/report/verification/full-report`, { params })
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.reports = res.data || [];
          } else {
            this.reports = [];
            alert('No data or failed to load.');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('report load error', err);
          this.isLoading = false;
          alert('Server error while loading report.');
        }
      });
  }

  openDetailModal(row: ReportRow, type: 'working' | 'notWorking' | 'shifted') {
    this.selectedRow = row;
    this.modalType = type;
    this.modalTitle = type === 'working' ? 'Working Details' : (type === 'notWorking' ? 'Not Working Details' : 'Shifted Details');
    this.isModalOpen = true;
    
    // Initialize map after modal opens
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalType = '';
    this.selectedRow = {} as ReportRow;
    // Destroy map
    this.mapService.destroyMap();
  }

  initializeMap() {
    let lat: number | undefined;
    let lng: number | undefined;

    // Get coordinates based on modal type and convert to numbers
    if (this.modalType === 'working') {
      lat = this.selectedRow.working_latitude ? parseFloat(String(this.selectedRow.working_latitude)) : undefined;
      lng = this.selectedRow.working_longitude ? parseFloat(String(this.selectedRow.working_longitude)) : undefined;
    } else if (this.modalType === 'notWorking') {
      lat = this.selectedRow.not_working_latitude ? parseFloat(String(this.selectedRow.not_working_latitude)) : undefined;
      lng = this.selectedRow.not_working_longitude ? parseFloat(String(this.selectedRow.not_working_longitude)) : undefined;
    } else if (this.modalType === 'shifted') {
      lat = this.selectedRow.shifted_latitude ? parseFloat(String(this.selectedRow.shifted_latitude)) : undefined;
      lng = this.selectedRow.shifted_longitude ? parseFloat(String(this.selectedRow.shifted_longitude)) : undefined;
    }

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return;
    }

    // Initialize map using the service
    try {
      this.mapService.initializeMap({
        containerId: 'mapContainer',
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

  getPhotos(raw: any): string[] {
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map(p => this.normalizePhotoUrl(p));
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(p => this.normalizePhotoUrl(p));
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

    if (url.startsWith('/')) {
      url = url.substring(1);
    }

    // Use base URL (without /api) for static files
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${url}`;
  }


  openImageViewer(images: string[], idx: number) {
    this.currentImageList = images;
    this.currentImageIndex = idx;
    this.currentImage = images[idx];
    this.isViewerOpen = true;
    document.addEventListener('keydown', this.handleKeyNavigation.bind(this));
  }

  closeImageViewer(event?: any) {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('image-viewer-overlay') && target.tagName !== 'BUTTON') {
        return;
      }
    }
    this.isViewerOpen = false;
    document.removeEventListener('keydown', this.handleKeyNavigation.bind(this));
  }

  nextImage(event?: any) {
    if (event) event.stopPropagation();
    if (this.currentImageList.length === 0) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImageList.length;
    this.currentImage = this.currentImageList[this.currentImageIndex];
  }

  prevImage(event?: any) {
    if (event) event.stopPropagation();
    if (this.currentImageList.length === 0) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.currentImageList.length) % this.currentImageList.length;
    this.currentImage = this.currentImageList[this.currentImageIndex];
  }

  handleKeyNavigation(event: KeyboardEvent) {
    if (!this.isViewerOpen) return;
    if (event.key === 'ArrowRight') this.nextImage();
    if (event.key === 'ArrowLeft') this.prevImage();
    if (event.key === 'Escape') this.closeImageViewer();
  }
}
