import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
@Pipe({
  name: 'customDateFormatter',
})
export class CustomDateFormatterPipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): unknown {
    if (value && value.toLowerCase != 'null') {
      return moment(value).format('DD/MM/yyyy');
    } else {
      return (value = '--');
    }
  }
}
