import { FormGroup } from '@angular/forms';

export function lengthGirthValidator(group: FormGroup) {
  const length = parseFloat(group.get('length')?.value);
  const girth = parseFloat(group.get('girth')?.value);

  if (isNaN(length) || isNaN(girth)) {
    return null;
  }

  if (length > girth) {
    return { girthLessThanLength: true };
  }

  return null;
}

