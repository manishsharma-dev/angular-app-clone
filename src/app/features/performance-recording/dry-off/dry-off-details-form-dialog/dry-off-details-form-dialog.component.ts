import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { animalBreedingValidations } from 'src/app/shared/validatator';
import { PrService } from '../../pr.service';

@Component({
  selector: 'app-dry-off-details-form-dialog',
  templateUrl: './dry-off-details-form-dialog.component.html',
  styleUrls: ['./dry-off-details-form-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DryOffDetailsFormDialogComponent {
  cmnValidation = animalBreedingValidations.common;
  dryOffForm = new FormGroup({
    dryOffRecordDate: new FormControl({
      value: moment(this.prService.currentDate).format('DD/MM/YYYY'),
      disabled: true,
    }),
    dryOffDate: new FormControl(moment(this.prService.currentDate), {
      validators: [Validators.required],
      updateOn: 'blur',
    }),
  });

  constructor(
    private dialogRef: MatDialogRef<DryOffDetailsFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public minDate: string,
    private prService: PrService
  ) {}

  onSubmit() {
    if (this.dryOffForm.invalid) {
      this.dryOffForm.markAllAsTouched();
      return;
    }

    const formValue = this.dryOffForm.getRawValue();

    formValue.dryOffRecordDate = moment(this.prService.currentDate).format(
      'YYYY-MM-DD'
    );
    formValue.dryOffDate = moment(formValue.dryOffDate).format('YYYY-MM-DD');

    this.dialogRef.close(formValue);
  }

  get today() {
    return moment(this.prService.currentDate).format('YYYY-MM-DD');
  }
}
