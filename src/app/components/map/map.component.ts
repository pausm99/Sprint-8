import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import mapboxgl, { LngLat, Map, Marker } from 'mapbox-gl';
import { Hotel } from '../../interfaces/hotel';
import { HotelsService } from '../../services/hotels.service';
import { CitypointsService } from '../../services/citypoints.service';
import { Citypoint } from '../../interfaces/citypoint';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';

mapboxgl.accessToken = environment.mapbox_key;

interface HotelMarker {
  marker: Marker;
  hotel: Hotel;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {

  @ViewChild('mapDiv')
  mapDivElement!: ElementRef;

  public hotelMarkers: HotelMarker[] = [];

  public map?: Map;
  public chicagoCoords: LngLat = new LngLat(-87.62, 41.88);

  public hotels: Hotel[] = [];
  public cityPoints: Citypoint[] = [];

  public layers: { [key: string]: Citypoint[] } = {};
  public categories: string[] = [];


  constructor(private hotelsService: HotelsService, private cityPointsService: CitypointsService, private fb: FormBuilder) {
    this.hotelsService.getHotels().subscribe({
      next: (res) => {
        this.hotels = res;
        this.createHotelMarkers();
      }
    }
    );
    this.cityPointsService.getCityPoints().subscribe({
      next: (res) => {
        this.cityPoints = res;
        this.classifyCityPoints();
        this.addLayerAndPoints();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.mapDivElement) throw 'HTML map element not found';

    this.map = new mapboxgl.Map({
      container: this.mapDivElement.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.chicagoCoords, // starting position [lng, lat]
      zoom: 11, // starting zoom
    });


    // Deelete points of interest by default
    this.map.on('load', () => {
      this.map!.removeLayer('poi-label');
      this.map!.removeLayer('transit-label');

    });
  }

  createHotelMarkers() {
    this.hotels.forEach(element => {
      this.createHotelMarker(element);
    });
  }

  createHotelMarker(hotel: Hotel): void {
    const lngLat = this.getLngLat(hotel.latitude, hotel.longitude);
    const marker = new Marker({
      color: 'red'
    }).setLngLat(lngLat)
      .setPopup(new mapboxgl.Popup({ offset: 25 })
      .setHTML('<h5 class="mt-2">' + hotel.hotel_name + '</h5>' + '<p>' + hotel.address + '</p>'
      ))
    .addTo(this.map!);
    const hotelMarker: HotelMarker = {
      marker: marker,
      hotel: hotel
    }
    this.hotelMarkers.push(hotelMarker);
  }

  getLngLat(lat: number, long: number): LngLat {
    return new LngLat(long, lat);
  }

  flyToMarker(marker: Marker) {
    this.map?.flyTo({
      zoom: 15,
      center: marker.getLngLat()
    })
  }

  classifyCityPoints() {
    this.cityPoints.forEach(cp => {
      const actualType = cp.type;
      if (this.layers[actualType]) this.layers[actualType].push(cp);
      else this.layers[actualType] = [cp];
    })
    this.categories = Object.keys(this.layers);
  }

  addLayerAndPoints() {
    this.map?.on('load', () => {

      Object.keys(this.layers).forEach((category) => {
        const sourceId = `${category.toLowerCase()}-source`;
        const layerId = `${category.toLowerCase()}-layer`;

        console.log(sourceId, layerId)

        // Add source to map
        this.map?.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.layers[category].map((item) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [item.longitude, item.latitude],
              },
              properties: {
                title: item.name,
                address: item.address,
              },
            })),
          },
        });

        // Add layer to map
        this.map?.addLayer({
          'id': layerId,
          'type': 'symbol',
          'source': sourceId,
          'layout': {
            // Make the layer visible by default.
            'visibility': 'visible',
            'icon-image': this.getIconType(category),
            'icon-allow-overlap': true,
            'icon-size': 2
          },

        });

        this.map!.on('click', layerId, (e) => {
          // Copy coordinates array.
          const coordinates = e.lngLat.toArray();
          const title = e.features![0].properties!['title'];
          const description = e.features![0].properties!['address'];


          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
          .setLngLat(new LngLat(coordinates[0], coordinates[1]))
          .setHTML('<h5 class="mt-2">' + title + '</h5>' + '<p>' + description + '</p>')
          .addTo(this.map!);
        });

          // Change the cursor to a pointer when the mouse is over the places layer.
        this.map!.on('mouseenter', layerId, () => {
          this.map!.getCanvas().style.cursor = 'pointer';
        });

          // Change it back to a pointer when it leaves.
        this.map!.on('mouseleave', layerId, () => {
            this.map!.getCanvas().style.cursor = '';
        });

      })
    })
  }

  handleLayer(category: string): void {
    category = category.toLowerCase()+'-layer';
    if (!this.map?.getLayer(category)) {
      return;
    }
    else {
      const visibility = this.map!.getLayoutProperty(
        category,
        'visibility'
      );
      if (visibility === 'visible') this.map?.setLayoutProperty(category, 'visibility', 'none');
      else this.map?.setLayoutProperty(category, 'visibility', 'visible');
    }
  }

  getIconType(category: string): string {
    category = category.toLocaleLowerCase();
    switch (category) {
      case 'sports':
        category = 'basketball';
        break;
      case 'shopping':
        category = 'shop';
        break;
      case 'entertainment':
        category = 'playground';
        break;
      default: category
        break;
    }
    return category;
  }

  centerMap() {
    this.map?.setCenter(this.chicagoCoords);
    this.map?.setZoom(11);
  }

}
