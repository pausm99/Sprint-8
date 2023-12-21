import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import mapboxgl, { LngLat, Map, Marker } from 'mapbox-gl';
import { Hotel } from '../../interfaces/hotel';
import { HotelsService } from '../../services/hotels.service';

mapboxgl.accessToken = environment.mapbox_key;

interface HotelMarker {
  marker: Marker;
  hotel: Hotel;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
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

  constructor(private hotelsService: HotelsService) {
    hotelsService.getHotels().subscribe(
      (res) => {
        this.hotels = res;
        this.createMarkers();
      }
    );
  }

  ngAfterViewInit(): void {
    if (!this.mapDivElement) throw 'HTML map element not found';

    this.map = new mapboxgl.Map({
      container: this.mapDivElement.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.chicagoCoords, // starting position [lng, lat]
      zoom: 12, // starting zoom
    });
  }

  createMarkers() {
    this.hotels.forEach(element => {
      this.createMarker(element)
    });
  }

  createMarker(hotel: Hotel): void {
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
}
