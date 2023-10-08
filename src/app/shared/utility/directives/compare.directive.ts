import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';

export function compareValidator(compareToNameCompare: string): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (c.value === null || c.value.length === 0) {
      return null
    }
    const comapreToCompare = c.root.get(compareToNameCompare);
    if (comapreToCompare) {
      const subscription : Subscription = comapreToCompare.valueChanges.subscribe(() => {
        c.updateValueAndValidity();
        subscription.unsubscribe();
      });
    }
    return comapreToCompare && comapreToCompare.value !== c.value ? { 'compare': true } : null;
  };

}

@Directive({
  selector: '[appCompare]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: CompareDirective, multi: true }]
})
export class CompareDirective {
}
