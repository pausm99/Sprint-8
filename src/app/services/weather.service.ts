import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Temperature } from '../interfaces/temperature';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.api_url;

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getTemperatures(): Observable<Temperature[]> {
    return this.http.get<Temperature[]>(`${API_URL}/graphics`);
  }
}
