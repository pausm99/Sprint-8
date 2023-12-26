import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../interfaces/calendar-event';


@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private http: HttpClient) { }

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>('http://localhost:3000/events');
  }

  createEvent(body: CalendarEvent): Observable<any>{
    return this.http.post<CalendarEvent>('http://localhost:3000/events', body);
  }

  deleteEvent(id: number): Observable<any>{
    return this.http.delete<CalendarEvent>(`http://localhost:3000/events/${id}`);
  }

  updateEvent(body: CalendarEvent): Observable<CalendarEvent> {
    const id = body.id;
    return this.http.patch<CalendarEvent>(`http://localhost:3000/events/${id}`, body);
  }
}
