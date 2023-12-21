import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Temperature } from '../interfaces/temperature';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getTemperatures(): Observable<Temperature[]> {
    return this.http.get<Temperature[]>('http://localhost:3000/graphics');
  }
}
