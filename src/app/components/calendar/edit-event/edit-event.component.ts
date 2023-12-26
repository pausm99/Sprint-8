import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomValidators } from '../../../validators/custom.validator';
import { CalendarEvent } from '../../../interfaces/calendar-event';
import { EventsService } from '../../../services/events.service';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.scss'
})
export class EditEventComponent implements OnInit {

  activeModal = inject(NgbActiveModal);

  @Input() event: CalendarEvent | undefined;
  public formChanged: boolean = false;

  eventForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required]),
    color: new FormControl('', [Validators.required])
  });

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.fillForm();
    this.eventForm.setValidators(CustomValidators.eventDates);
    this.eventForm.valueChanges.subscribe(() => this.formChanged = true)
  }

  fillForm(): void {
    this.eventForm.reset(this.event);

    const check_inFormattedDate = this.getFormattedDate(this.event?.start!);
    const check_outFormattedDate = this.getFormattedDate(this.event?.end!);


    this.eventForm.patchValue({
      start: check_inFormattedDate,
      end: check_outFormattedDate,
    });
  }

  getFormattedDate(dateStr: string): string {
    const dateObject = new Date(dateStr);
    return dateObject.toISOString().split('.')[0];
  }

  editEvent() {
    const formValues = this.eventForm.value;

    const editedEvent: CalendarEvent = {
      id: Number(this.event?.id),
      title: formValues.title!,
      start: this.getFormattedDate(formValues.start!),
      end: this.getFormattedDate(formValues.end!),
      color: formValues.color!
    }
    if (this.formChanged) {
      this.eventsService.updateEvent(editedEvent).subscribe(
        {
          next: () => {
            this.activeModal.close({reason: 'edited', eventUpdated: editedEvent});
          },
        }
      );
    } else this.activeModal.close();
  }

  deleteEvent() {
    this.eventsService.deleteEvent(Number(this.event?.id)).subscribe({
      next: () => {
        this.activeModal.close({reason: 'deleted', id: this.event?.id})
      },
      error: (error) => console.log(error)
    })
  }

}
