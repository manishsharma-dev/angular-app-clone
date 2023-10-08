import { AbstractControl, ValidatorFn } from '@angular/forms';

export function decimalWithLengthValidation(
  beforeDecimalLength: number,
  afterDecimalLength: number
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
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

    if (
      (beforeDecimal.startsWith('+') || beforeDecimal.startsWith('-')) &&
      beforeDecimal?.length > beforeDecimalLength + 1
    ) {
      return { invalidDecimalNo: true };
    } else if (beforeDecimal?.length > beforeDecimalLength) {
      return { invalidDecimalNo: true };
    }

    if (afterDecimal?.length > afterDecimalLength) {
      return { invalidDecimalNo: true };
    }
    return null;
  };
}
