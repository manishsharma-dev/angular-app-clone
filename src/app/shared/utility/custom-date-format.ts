import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDateFormats } from '@angular/material/core';
import moment from 'moment';

export const CUSTOM_DATE_FORMAT: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
    monthLabel: 'MMMM',
  },
};

export class CustomDateAdapter extends MomentDateAdapter {
  constructor(locale: string) {
    super(locale, {});
  }

  format(date: moment.Moment, displayFormat: string): string {
    return moment(date).format(displayFormat);
  }

  parse(value: string): moment.Moment {
    if (!value) {
      return null;
    }

    if (value.length > 10 || value.length < 8) {
      return this.invalid();
    }

    const parts = value.split('/');
    if (parts.length !== 3) {
      return this.invalid();
    }

    const result = parts.some((part) => isNaN(+part));
    if (result) {
      return this.invalid();
    }

    const parsedDate = moment(parts, 'DD/MM/YYYY');
    if (!parsedDate.isValid()) {
      return this.invalid();
    }
    return parsedDate;
  }
}
