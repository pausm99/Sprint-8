import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../interfaces/calendar-event';
import { environment } from '../../environments/environment';

const API_URL = environment.api_url;


@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private http: HttpClient) { }

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${API_URL}/events`);
  }

  createEvent(body: CalendarEvent): Observable<any>{
    return this.http.post<CalendarEvent>(`${API_URL}/events`, body);
  }

  deleteEvent(id: number): Observable<any>{
    return this.http.delete<CalendarEvent>(`${API_URL}/events/${id}`);
  }

  updateEvent(body: CalendarEvent): Observable<CalendarEvent> {
    const id = body.id;
    return this.http.patch<CalendarEvent>(`${API_URL}/events/${id}`, body);
  }
}
