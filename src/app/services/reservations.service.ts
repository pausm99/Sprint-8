import { Injectable } from '@angular/core';
import { Reservation } from '../interfaces/reservation';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API_URL = environment.api_url;

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {

  constructor(private http: HttpClient) { }

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${API_URL}/reservations`);
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete<Reservation>(`${API_URL}/reservations/${id}`);
  }

  createReservation(body: Reservation): Observable<any> {
    return this.http.post<Reservation>(`${API_URL}/reservations`, body);
  }

  updateReservation(body: Reservation): Observable<any> {
    const id = body.id;
    console.log(body);
    return this.http.patch<Reservation>(`http://localhost:3000/reservations/${id}`, body);
  }

}
