import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Hotel } from '../interfaces/hotel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelsService {

  constructor(private http: HttpClient) { }

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>('http://localhost:3000/hotels/');
  }
}
