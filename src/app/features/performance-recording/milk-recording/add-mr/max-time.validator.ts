import { FormGroup } from '@angular/forms';
import moment from 'moment';

export function MaxTimeValidation(group: FormGroup) {
  const mrDate = moment(
    moment(group.get('mrDate')?.value).format('YYYY-MM-DD')
  );
  const today = moment(
    moment(new Date(sessionStorage.getItem('serverCurrentDateTime'))).format(
      'YYYY-MM-DD'
    )
  );

  if (mrDate.isBefore(today)) {
    return null;
  }

  const mrTime = moment(
    moment(new Date(sessionStorage.getItem('serverCurrentDateTime'))).format(
      'YYYY-MM-DD'
    ) +
      ' ' +
      group.get('mrTime').value
  );

  if (
    mrTime.isAfter(
      moment(new Date(sessionStorage.getItem('serverCurrentDateTime')))
    )
  ) {
    return { greaterThanCurrentTime: true };
  }

  return null;
}
