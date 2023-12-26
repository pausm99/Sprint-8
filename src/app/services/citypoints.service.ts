import { Citypoint } from './../interfaces/citypoint';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.api_url;

@Injectable({
  providedIn: 'root'
})
export class CitypointsService {

  constructor(private http: HttpClient) { }

  getCityPoints(): Observable<Citypoint[]> {
    return this.http.get<Citypoint[]>(`${API_URL}/citypoints`);
  }
}
