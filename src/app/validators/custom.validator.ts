import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export class CustomValidators extends Validators {
  static emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
    if (emailRegex.test(control.value)) return null;
    else if (control.value === null || control.value === '') {
      return null;
    }
    return { invalidEmail: true };
  };

  static customPhone: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const regex = /^\d{9}$/;
    return (regex.test(control.value) ? null : { invalidPhone: true });
  }

  static checkInDates: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const check_in = control.get('check_in')?.value;
    const check_out = control.get('check_out')?.value;

    if (check_in !== '' && check_out !== '' && check_in > check_out) {
      return { 'check_inMinor': true };
    }
    return null;
  }

  static eventDates: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const check_in = control.get('start')?.value;
    const check_out = control.get('end')?.value;

    if (check_in !== '' && check_out !== '' && check_in > check_out) {
      return { 'check_inMinor': true };
    }
    return null;
  }

}
