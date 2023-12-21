import { Reservation } from './../../../interfaces/reservation';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Hotel } from '../../../interfaces/hotel';
import { ReservationsService } from '../../../services/reservations.service';
import { CustomValidators } from '../../../validators/custom.validator';


@Component({
  selector: 'app-add-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-reservation.component.html',
  styleUrl: './add-reservation.component.scss'
})
export class AddReservationComponent implements OnInit{

  activeModal = inject(NgbActiveModal);

  @Input() hotels: Hotel[] = [];

  reservationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, CustomValidators.emailValidator]),
    phone: new FormControl('', [Validators.required, CustomValidators.customPhone]),
    hotel: new FormControl('', [Validators.required]),
    check_in: new FormControl('', [Validators.required]),
    check_out: new FormControl('', [Validators.required]),
  });

  constructor(private reservationsService: ReservationsService) {}

  ngOnInit(): void {
    this.reservationForm.setValidators(CustomValidators.checkInDates);
  }

  createReservation() {
    if (this.reservationForm.valid) {
      const formValues = this.reservationForm.value;
      const hotelID = formValues.hotel!;

      const reservation: Reservation = {
        guest_name: formValues.name!,
        email: formValues.email!,
        phone_number: formValues.phone!,
        hotel_id: Number(formValues.hotel!),
        hotel_name: this.hotels[Number(hotelID)-1].hotel_name,
        check_in: formValues.check_in!,
        check_out: formValues.check_out!
      }

      this.reservationsService.createReservation(reservation).subscribe(
        {
          next: (createdReservation: Reservation) => {
            createdReservation.hotel_name = reservation.hotel_name;
            this.activeModal.close(createdReservation);
          },
          error: (err) => console.log(err)
        }
      );
    }
  }
}
