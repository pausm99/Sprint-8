import { Reservation } from './../../interfaces/reservation';
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ReservationsService } from '../../services/reservations.service';
import { HotelsService } from '../../services/hotels.service';
import { Hotel } from '../../interfaces/hotel';
import { WeatherService } from '../../services/weather.service';
import { Temperature } from '../../interfaces/temperature';
import * as d3 from 'd3';

Chart.register(...registerables);


interface Ocurrences {
  [hotelName: string]: number;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {

  constructor(
    private reservationsService: ReservationsService,
    private hotelsService: HotelsService,
    private weatherService: WeatherService) {}

  labelDataReservations: string[] = [];
  realDataReservations: Ocurrences = {};

  labelDataTemperature: string[] = [];
  realDataTemperature: number[] = [];
  colors: string[] = [];

  ngOnInit(): void {
    this.hotelsService.getHotels().subscribe({
      next: (result) => {
        this.fillLabelDataHotels(result);
        this.reservationsService.getReservations().subscribe({
          next: (value) => {
            this.fillRealDataReservations(value, result);
            this.renderChart1(this.labelDataReservations, Object.values(this.realDataReservations));
          }
        })
      }
    })
    this.weatherService.getTemperatures().subscribe({
      next: (result) => {
        this.fillDataTemperatures(result);
        this.colors = this.getColorsForTemperatures(this.realDataTemperature);
        this.renderChart2(this.labelDataTemperature, this.realDataTemperature);
      }
    })
  }

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView();
    }
  }

  fillDataTemperatures(temperatures: Temperature[]) {
    temperatures.forEach(t => {
      this.labelDataTemperature.push(t.month);
      this.realDataTemperature.push(t.temperature);
    });
  }

  fillLabelDataHotels(hotels: Hotel[]) {
    hotels.forEach(hotel => this.labelDataReservations.push(hotel.hotel_name));
  }

  fillRealDataReservations(reservations: Reservation[], hotels: Hotel[]) {
    for (const hotel of hotels) {
      this.realDataReservations[hotel.hotel_name] = 0
    }

    reservations.forEach((res) => {
      if (this.realDataReservations.hasOwnProperty(res.hotel_name!)) {
        this.realDataReservations[res.hotel_name!]++
      }
    });
  }

  getColorsForTemperatures(temperatures: number[]): string[] {
    const minTemperature = Math.min(...temperatures);
    const maxTemperature = Math.max(...temperatures);

    // Escala de colores de frío a cálido (puedes ajustar los colores según tus preferencias)
    const coldColor: string = 'blue';
    const hotColor: string = 'red';

    const colorScale = d3.scaleLinear<string>()
      .domain([minTemperature, maxTemperature])
      .range([coldColor, hotColor]);

    // Mapear cada temperatura a su respectivo color en la escala
    const colors: string[] = temperatures.map(temperature => colorScale(temperature));

    return colors;
  }


  renderChart1(labels: string[], data: number[]) {
    new Chart('chart1', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reservations per hotel',
          data: data,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderChart2(labels: string[], data: number[]) {
    new Chart('chart2', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Chicago's Temperautre (Cº)`,
          data: data,
          fill: false,
          pointBackgroundColor: this.colors,
          borderWidth: 1,
          pointRadius: 5,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  }
}
