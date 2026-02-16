import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

interface MapMarkerOptions {
  latitude: number;
  longitude: number;
  popupContent: string;
  openPopup?: boolean;
}

interface MapInitOptions {
  containerId: string;
  latitude: number;
  longitude: number;
  zoom?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeafletMapService {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Initialize a new map or return existing one
   */
  initializeMap(options: MapInitOptions): L.Map {
    const { containerId, latitude, longitude, zoom = 13 } = options;

    // Destroy existing map if any
    this.destroyMap();

    const mapElement = document.getElementById(containerId);
    if (!mapElement) {
      throw new Error(`Map container with id '${containerId}' not found`);
    }

    // Initialize map
    this.map = L.map(containerId).setView([latitude, longitude], zoom);

    // Add tile layer with offline fallback
    this.addTileLayer();

    return this.map;
  }

  /**
   * Add tile layer with offline placeholder support
   */
  private addTileLayer(): void {
    if (!this.map) return;

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      errorTileUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect fill="%23f0f0f0" width="256" height="256"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999">Offline</text></svg>'
    });

    tileLayer.addTo(this.map);

    // Fallback to offline placeholder tiles if network is unavailable
    tileLayer.on('tileerror', (error: any) => {
      console.warn('Tile loading error, using offline placeholder', error);
    });
  }

  /**
   * Add a marker to the map
   */
  addMarker(options: MapMarkerOptions): L.Marker {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    const { latitude, longitude, popupContent, openPopup = true } = options;

    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Create and add new marker
    this.marker = L.marker([latitude, longitude])
      .addTo(this.map)
      .bindPopup(popupContent);

    if (openPopup) {
      this.marker.openPopup();
    }

    return this.marker;
  }

  /**
   * Update marker location and popup
   */
  updateMarker(latitude: number, longitude: number, popupContent: string): L.Marker {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    // Pan map to new location
    this.map.setView([latitude, longitude], 13);

    // Update marker
    return this.addMarker({
      latitude,
      longitude,
      popupContent,
      openPopup: true
    });
  }

  /**
   * Get address from coordinates using Nominatim API
   */
  getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

      this.http.get<any>(nominatimUrl).subscribe({
        next: (response) => {
          if (response && response.address) {
            const address = this.buildAddressString(response.address);
            resolve(address);
          } else {
            reject('No address found');
          }
        },
        error: () => {
          reject('Failed to fetch address from Nominatim');
        }
      });
    });
  }

  /**
   * Build address string from address components
   */
  private buildAddressString(addressComponents: any): string {
    const addressParts = [];

    if (addressComponents.road) addressParts.push(addressComponents.road);
    if (addressComponents.village) addressParts.push(addressComponents.village);
    if (addressComponents.town) addressParts.push(addressComponents.town);
    if (addressComponents.city) addressParts.push(addressComponents.city);
    if (addressComponents.county) addressParts.push(addressComponents.county);
    if (addressComponents.state) addressParts.push(addressComponents.state);
    if (addressComponents.country) addressParts.push(addressComponents.country);

    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not found';
  }

  /**
   * Create popup content HTML with applicant details
   */
  createPopupContent(
    applicantName: string,
    latitude: number,
    longitude: number,
    address?: string,
    additionalDetails?: { [key: string]: any }
  ): string {
    let content = `
      <div class="map-popup">
        <strong>${applicantName}</strong><br>
    `;

    if (address) {
      content += `<strong>Address:</strong> ${address}<br>`;
    }

    content += `<strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    if (additionalDetails) {
      for (const [key, value] of Object.entries(additionalDetails)) {
        if (value) {
          content += `<br><strong>${key}:</strong> ${value}`;
        }
      }
    }

    content += '</div>';
    return content;
  }

  /**
   * Get current map instance
   */
  getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Get current marker instance
   */
  getMarker(): L.Marker | null {
    return this.marker;
  }

  /**
   * Destroy the map and clean up resources
   */
  destroyMap(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Pan map to specific coordinates
   */
  panTo(latitude: number, longitude: number, zoom?: number): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    if (zoom) {
      this.map.setView([latitude, longitude], zoom);
    } else {
      this.map.panTo([latitude, longitude]);
    }
  }

  /**
   * Fit bounds to show all markers
   */
  fitBounds(bounds: L.LatLngBoundsExpression): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initializeMap first.');
    }

    this.map.fitBounds(bounds);
  }
}
