import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'age',
})
export class AgePipe implements PipeTransform {
  currentDate = moment(
    new Date(sessionStorage.getItem('serverCurrentDateTime'))
  );

  transform(
    startDate: string | Date | moment.Moment,
    endDate: string | Date | moment.Moment = this.currentDate
  ) {
    return this.getAge(startDate, endDate);
  }

  getAge(
    startDate: string | Date | moment.Moment,
    endDate: string | Date | moment.Moment
  ) {
    const startDateMoment = moment(startDate);
    const endDateMoment = moment(endDate);

    const years = endDateMoment.diff(startDateMoment, 'years');
    startDateMoment.add(years, 'years');

    const months = endDateMoment.diff(startDateMoment, 'months');
    startDateMoment.add(months, 'months');

    const days = endDateMoment.diff(startDateMoment, 'days');

    return `${years > 0 ? years + 'Y' : ''}  
            ${months > 0 ? months + 'M' : ''}
            ${days > 0 ? days + 'D' : ''}`;
  }
}
