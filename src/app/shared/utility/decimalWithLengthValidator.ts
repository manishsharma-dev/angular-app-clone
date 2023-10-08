import { AbstractControl, ValidatorFn } from '@angular/forms';

export function decimalWithLengthValidation(
  precision: number,
  scale: number
): ValidatorFn {
  return (control: AbstractControl): { invalidDecimalNo: boolean } => {
    if (
      control.value === null ||
      control.value === '' ||
      typeof control.value === 'undefined'
    ) {
      return null;
    }

    const value = `${control.value}`;

    const regex = new RegExp('^[+-]?([0-9]+\\.?[0-9]*|\\.[0-9]+)$');

    if (!regex.test(value)) {
      return { invalidDecimalNo: true };
    }

    const [beforeDecimal, afterDecimal] = value.split('.');

    let totalLength = precision;

    if (beforeDecimal.startsWith('+') || beforeDecimal.startsWith('-')) {
      totalLength++;
    }

    if (beforeDecimal?.length > totalLength - scale) {
      return { invalidDecimalNo: true };
    }

    if (afterDecimal?.length > scale) {
      return { invalidDecimalNo: true };
    }
    return null;
  };
}
