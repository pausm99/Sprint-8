export interface Reservation {
  id?: number;
  guest_name: string;
  email: string;
  phone_number: string;
  hotel_name?: string;
  hotel_id?: number;
  check_in: string;
  check_out: string;
}
