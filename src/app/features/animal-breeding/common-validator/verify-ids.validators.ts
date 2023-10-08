import { AbstractControl, ValidatorFn } from "@angular/forms";

export function VerifyIDS(idValid:boolean): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const forbidden = idValid;
    return forbidden ? { 'forbiddenName' : { value: control.value } } : null;
  };
}