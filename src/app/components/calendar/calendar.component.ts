import { Component, OnInit, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Calendar, CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import esLocale from '@fullcalendar/core/locales/es';
import { ReservationsService } from '../../services/reservations.service';
import { Reservation } from '../../interfaces/reservation';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsService } from '../../services/events.service';
import { CalendarEvent } from '../../interfaces/calendar-event';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { EditEventComponent } from './edit-event/edit-event.component';
import { CustomValidators } from '../../validators/custom.validator';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, ReactiveFormsModule, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {

  public events: CalendarEvent[] = [];
  public calendar?: Calendar;

  private modalService = inject(NgbModal);

  constructor(private reservationsService: ReservationsService, private eventsService: EventsService,  config: NgbModalConfig) {
    this.reservationsService.getReservations().subscribe({
      next: (res) => {
        this.events = this.events.concat(this.reservationsToEvents(res)!);
        eventsService.getEvents().subscribe({
          next: (data) => {
            this.events = this.events.concat(data);
            this.initCalendar();
          }
        })
      }
    });
    config.backdrop = 'static';
    config.keyboard = false;
  }

  eventForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required]),
    color: new FormControl('', [Validators.required])
  });

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    editable: true,
    themeSystem: 'bootstrap5',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, bootstrap5Plugin],
    droppable: true,
    events: [],
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: (info) => {
      this.openEventModal(info);
    }
  }

  ngOnInit(): void {
    this.eventForm.setValidators(CustomValidators.eventDates);
  }

  reservationsToEvents(reservation: Reservation[]): CalendarEvent[] {
    const formattedEvents = reservation.map(reservation => ({
      title: reservation.hotel_name,
      start: reservation.check_in,
      end: reservation.check_out,
    })) as CalendarEvent[];

    return formattedEvents;
  }

  initCalendar() {
    this.calendarOptions.events = this.events as EventInput[];
    this.calendar = new Calendar(document.getElementById('calendar')!, this.calendarOptions);
    this.calendar.render();
  }

  createEvent() {
    if (this.eventForm.valid) {
      const formValues = this.eventForm.value;
      let event: CalendarEvent = {
        title: formValues.title!,
        start: formValues.start!,
        end: formValues.end!,
        color: formValues.color!
      }
      this.eventsService.createEvent(event).subscribe({
        next: (eventCreated) => {
          this.events = [...this.events, eventCreated];
          this.calendar?.addEvent(eventCreated);
        }
      });
    }
  }

  openEventModal(info: EventClickArg): void {
    const modalref = this.modalService.open(EditEventComponent);
    const { title, start, end, id, backgroundColor } = info.event;
    modalref.componentInstance.event = { title: title, start: start, end: end, id: id, color: backgroundColor };
    modalref.closed.subscribe((result) => {
      if (result.reason === 'deleted') {
        const id = result.id;
        const indexToRemove = this.events.findIndex(ev => ev.id === id);
        if (indexToRemove !== -1) {
          this.events.splice(indexToRemove, 1);
        }
        const event = this.calendar?.getEventById(id);
        event?.remove();
      }
      else if (result.reason === 'edited') {
        const event: CalendarEvent = result.eventUpdated;
        const indexToUpdate = this.events.findIndex(e => e.id == event.id);
        if (indexToUpdate !== -1) this.events[indexToUpdate] = { ...this.events[indexToUpdate], ...result.eventUpdated };
        this.initCalendar();
      }
    });
  }
}
