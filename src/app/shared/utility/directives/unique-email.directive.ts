import { Directive } from '@angular/core';
import { AsyncValidatorFn, AsyncValidator, NG_ASYNC_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { UserService } from 'src/app/shared/user/user.service';



export function existingEmailValidator(userService: UserService): AsyncValidatorFn {

  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return userService.getUserByEmail(control.value).toPromise().then(
      users => {
        return (users) ? { "emailExists": true } : null;
      }
    );
  };
}


export function existingEarTagValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return userService.getEarTag(control.value).toPromise().then(
      tag => {
        return (tag) ? null : { "tagExists": true };
      }
    );
  };
}

export function existingAadhaarValidator(userService: UserService): AsyncValidatorFn {

  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return userService.getAadhaar(control.value).toPromise().then(
      aadhaar => {
        return (aadhaar) ? null : { "aadhaarExists": true };
      }
    )
  };
}

export function existinguserAadhaarValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
 
      return userService.getAadhaarUser(control.value).pipe(debounceTime(1000)).toPromise().then(
        aadhaar => {
          return (aadhaar) ? null : { "aadhaarExists": true };
        }
      ).catch(err => {
        return (err.error) ? { "aadhaarExists": true } : null;
      });
    

  };
}

export function semenStationCdExist(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      return userService.semenStationCdExist(control.value).pipe(debounceTime(1000)).toPromise().then(
        semenStationCd => {
          return (semenStationCd['data']) ? null:{ "semenStation": true } ;
        }
      );
  };
}




@Directive({
  selector: '[appUniqueEmail]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: UniqueEmailDirective, multi: true }]
})

export class UniqueEmailDirective implements AsyncValidator {

  constructor(private userService: UserService) { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let email = existingEmailValidator(this.userService)(control);
    let tag = existingEarTagValidator(this.userService)(control);
    let aadhaar = existingAadhaarValidator(this.userService)(control);
    let semenStation = semenStationCdExist(this.userService)(control);
    return null;
  }

}
