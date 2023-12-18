import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReservationsService } from '../../services/reservations.service';
import { Reservation } from '../../interfaces/reservation';
import { HotelsService } from '../../services/hotels.service';
import { Hotel } from '../../interfaces/hotel';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AddReservationComponent } from './add-reservation/add-reservation.component';
import { EditReservationComponent } from './edit-reservation/edit-reservation.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  public reservations: Reservation[] = [];
  public hotels: Hotel[] = [];

  private modalService = inject(NgbModal);


  constructor(private reservationsService: ReservationsService, private hotelsService: HotelsService, config: NgbModalConfig) {
    this.reservationsService.getReservations().subscribe(
      (response) => {
        console.log(response);
        this.reservations = response;
      }
    );
    this.hotelsService.getHotels().subscribe(
      (response) => {
        console.log(response);
        this.hotels = response;
      }
    );
    config.backdrop = 'static';
    config.keyboard = false;
  }

  deleteReservation(id: number): void {
    this.reservationsService.deleteReservation(id).subscribe(
      {
        next: (res) => {
          this.reservations = this.reservations.filter(reservation => reservation.id !== id);
        },
        error: (err) => console.log(err)
      }
    )
  }

  createReservation() {
    if (this.hotels.length > 0) {
      const modalref = this.modalService.open(AddReservationComponent);
      modalref.componentInstance.hotels = this.hotels;
      modalref.closed.subscribe((reservationCreated: Reservation) => {
        this.reservations.push(reservationCreated);
      });
    }
    else alert('Reservation service is not available at the moment');
  }

  editReservation(reservation: Reservation) {
    console.log(reservation);
    if (this.hotels.length > 0) {
      const modalRef = this.modalService.open(EditReservationComponent);
      modalRef.componentInstance.reservation = reservation;
      modalRef.componentInstance.hotels = this.hotels;
      modalRef.closed.subscribe((reservationUpdated: Reservation) => {
        let indexToUpdate = this.reservations.findIndex(r => r.id === reservationUpdated.id);
        if (indexToUpdate !== -1) this.reservations[indexToUpdate] = { ...this.reservations[indexToUpdate], ...reservationUpdated };
      });
    }
  }
}
