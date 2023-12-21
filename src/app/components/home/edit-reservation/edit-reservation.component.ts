import { Reservation } from './../../../interfaces/reservation';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Hotel } from '../../../interfaces/hotel';
import { ReservationsService } from '../../../services/reservations.service';
import { CustomValidators } from '../../../validators/custom.validator';

@Component({
  selector: 'app-edit-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,CommonModule, NgbDatepickerModule],
  templateUrl: './edit-reservation.component.html',
  styleUrl: './edit-reservation.component.scss'
})
export class EditReservationComponent implements OnInit {

  activeModal = inject(NgbActiveModal);


  @Input() hotels: Hotel[] = [];
  @Input() reservation: Reservation | undefined;

  reservationForm: FormGroup;

  constructor(private reservationsService: ReservationsService) {
    this.reservationForm = new FormGroup({
      guest_name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, CustomValidators.emailValidator]),
      phone_number: new FormControl('', [Validators.required, CustomValidators.customPhone]),
      hotel_name: new FormControl(null, [Validators.required]),
      check_in: new FormControl('', [Validators.required]),
      check_out: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.fillForm();
    this.reservationForm.setValidators(CustomValidators.checkInDates);
  }

  fillForm(): void {
    this.reservationForm.reset(this.reservation);

    const check_inFormattedDate = this.getFormattedDate(this.reservation?.check_in!);
    const check_outFormattedDate = this.getFormattedDate(this.reservation?.check_out!);
    this.reservationForm.patchValue({
      check_in: check_inFormattedDate,
      check_out: check_outFormattedDate,
    });
  }

  editReservation() {
    if (this.reservationForm.valid) {
      const formValues = this.reservationForm.value;

      console.log(this.reservation);

      const editReservation: Reservation = {
        id: this.reservation?.id!,
        guest_name: formValues.guest_name!,
        email: formValues.email!,
        phone_number: formValues.phone_number!,
        hotel_id: this.getHotelID(formValues.hotel_name),
        hotel_name: formValues.hotel_name,
        check_in: formValues.check_in!,
        check_out: formValues.check_out!
      }

      this.reservationsService.updateReservation(editReservation).subscribe(
        {
          next: () => {
            this.activeModal.close(editReservation);
          },
          error: (err) => console.log(err)
        }
      );
    }
  }

  getFormattedDate(date: string): string {
    return date.split('.')[0]!;
  }

  getHotelID(name: string): number {
    return this.hotels.find(h => h.hotel_name === name)?.id!;
  }

}
